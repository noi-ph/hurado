import { db } from "db";
import { sha256 } from "common/utils/hashing";
import { SubmissionRequestDTO } from "common/validation/submission_validation";
import { SubmissionFileStorage } from "server/files";
import { SubmissionSummaryDTO, UserPublic } from "common/types";
import { Language } from "common/types/constants";

export type SubmissionFileCreate = {
  file: File;
  filename: string | null;
};

type SubmissionFileUpload = {
  filename: string | null;
  size: number;
  hash: string;
};

export async function createSubmission(
  sources: SubmissionFileCreate[],
  request: SubmissionRequestDTO,
  user: UserPublic
): Promise<SubmissionSummaryDTO> {
  const uploads = await uploadSubmissionSources(sources);

  return db.transaction().execute(async (trx) => {
    const submission = await trx
      .insertInto("submissions")
      .values({
        user_id: user.id,
        task_id: request.task_id,
        language: request.language,
      })
      .returning(["id", "created_at"])
      .executeTakeFirstOrThrow();

    await trx
      .insertInto("submission_files")
      .values(
        uploads.map((u) => ({
          hash: u.hash,
          size: u.size,
          file_name: u.filename,
          submission_id: submission.id,
        }))
      )
      .execute();

    return {
      id: submission.id,
      language: request.language as Language,
      username: null,
      created_at: submission.created_at,
      verdict_id: null,
      verdict: null,
      score: null,
      running_time_ms: null,
      running_memory_byte: null,
    };
  });
}

async function uploadSubmissionSources(
  sources: SubmissionFileCreate[]
): Promise<SubmissionFileUpload[]> {
  const hashes = await Promise.all(
    sources.map(async (source) => {
      const buffer = Buffer.from(await source.file.arrayBuffer());
      const hash = await sha256(buffer);
      return {
        buffer,
        hash,
        size: source.file.size,
        filename: source.filename,
      };
    })
  );

  if (hashes.length == 0) {
    return [];
  }

  const dbsubfiles = await db
    .selectFrom("submission_files")
    .select("hash")
    .where(
      "hash",
      "in",
      hashes.map((h) => h.hash)
    )
    .execute();

  const uploaded = new Set(dbsubfiles.map((s) => s.hash));

  return Promise.all(
    hashes.map(async (source) => {
      if (!uploaded.has(source.hash)) {
        await uploadSubmissionFile(source.buffer, source.hash);
      }
      return {
        filename: source.filename,
        size: source.size,
        hash: source.hash,
      };
    })
  );
}

async function uploadSubmissionFile(buffer: Buffer, hash: string): Promise<string> {
  await SubmissionFileStorage.uploadFromBuffer(hash, buffer);
  return hash;
}
