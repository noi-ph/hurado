import { db } from "db";
import { sha256 } from "common/utils/hashing";
import { SubmissionRequestDTO } from "common/validation/submission_validation";
import { SubmissionFileStorage } from "server/files";
import { UserPublic } from "common/types";

export async function createSubmission(
  source: File,
  request: SubmissionRequestDTO,
  user: UserPublic,
) {
  const fileHash = await uploadSubmissionSource(source);
  const submission = await db.insertInto("submissions").values({
    user_id: user.id,
    task_id: request.task_id,
    file_hash: fileHash,
    language: request.language,
    runtime_args: getLanguageRuntimeArgs(request.language),
  }).returning([
    'id',
    'file_hash',
    'created_at',
  ]).executeTakeFirstOrThrow();
  return submission;
}

async function uploadSubmissionSource(source: File): Promise<string> {
  const buffer = await source.arrayBuffer();
  const hash = await sha256(buffer);

  const current = await db
    .selectFrom("submissions")
    .select("file_hash")
    .where("file_hash", "=", hash)
    .executeTakeFirst();

  if (current != null) {
    return current.file_hash;
  }

  const blobClient = SubmissionFileStorage.getBlockBlobClient(hash);
  await blobClient.uploadData(buffer);
  return hash;
}

function getLanguageRuntimeArgs(_language: string) {
  return null;
}
