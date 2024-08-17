import { NextRequest, NextResponse } from "next/server";
import { FileUploadResponse } from "common/types/files";
import { sha256 } from "common/utils/hashing";
import { db } from "db";
import { canManageTasks } from "server/authorization";
import { TaskFileStorage } from "server/files";
import { getSession } from "server/sessions";

export async function POST(request: NextRequest) {
  // This accepts one uploaded file, hashes it, and stores it in blob storage
  // if the file hash already exists, it just returns the hash of the file
  // with status code 409_Conflict
  const session = getSession(request);
  if (!canManageTasks(session)) {
    return NextResponse.json({}, { status: 401 });
  }

  const blob = await request.blob();
  const buffer = await blob.arrayBuffer();
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

  const blobClient = TaskFileStorage.getBlockBlobClient(hash);
  await blobClient.uploadData(buffer);

  try {
    const file = await db
      .insertInto("files")
      .values({
        hash: hash,
        size: blob.size,
      })
      .returning("hash")
      .executeTakeFirstOrThrow();

    return NextResponse.json<FileUploadResponse>({
      hash: file.hash,
    });
  } catch {
    return NextResponse.json<FileUploadResponse>({
      hash,
    });
  }
}
