import { NextRequest, NextResponse } from "next/server";
import { FileUploadResponse } from "common/types/files";
import { sha256 } from 'common/utils/hashing';
import { db } from 'db';
import { canManageTasks } from "server/authorization";
import { TaskFileStorage } from 'server/files';
import { getSession } from "server/sessions";

export async function POST(request: NextRequest) {
  const session = getSession(request);
  if (!canManageTasks(session)) {
    return NextResponse.json({}, { status: 401 });
  }

  const blob = await request.blob();
  const hash = await sha256(blob);
  const blobClient = TaskFileStorage.getBlockBlobClient(hash);
  await blobClient.uploadData(blob);

  const file = await db.insertInto('files').values({
    hash: hash,
    size: blob.size,
  }).returning('hash').executeTakeFirstOrThrow();

  return NextResponse.json<FileUploadResponse>({
    hash: file.hash,
  });
}
