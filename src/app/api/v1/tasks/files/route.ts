import { NextRequest, NextResponse } from "next/server";
import { FileUploadResponse } from "common/types/files";
import { sha256 } from "common/utils/hashing";
import { db } from "db";
import { canManageTasks } from "server/authorization";
import { TaskFileStorage } from "server/files";
import { getSession } from "server/sessions";

function isFile(obj: FormDataEntryValue): obj is File {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- pre-existing error before eslint inclusion
  return typeof (obj as any)['arrayBuffer'] === 'function';
}

export async function POST(request: NextRequest) {
  // This accepts one uploaded file, hashes it, and stores it in blob storage
  // if the file hash already exists, it just returns the hash of the file
  // with status code 409_Conflict
  const session = await getSession(request);
  if (!canManageTasks(session, request)) {
    return NextResponse.json({}, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');
  if (file == null || !isFile(file)) {
    return NextResponse.json({ error: "File not attached" }, { status: 400 });
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const hash = await sha256(buffer);

  const current = await db
    .selectFrom("files")
    .select("hash")
    .where("hash", "=", hash)
    .executeTakeFirst();

  if (current != null) {
    return NextResponse.json<FileUploadResponse>(
      {
        hash: current.hash,
      },
      { status: 409 }
    );
  }

  await TaskFileStorage.uploadFromBuffer(hash, buffer);

  try {
    const uploadedFile = await db
      .insertInto("files")
      .values({
        hash: hash,
        size: file.size,
      })
      .returning("hash")
      .executeTakeFirstOrThrow();
    return NextResponse.json<FileUploadResponse>({
      hash: uploadedFile.hash,
    });
  } catch {
    return NextResponse.json<FileUploadResponse>({
      hash,
    });
  }
}
