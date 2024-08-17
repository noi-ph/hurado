import { NextRequest, NextResponse } from "next/server";
import { TaskAttachmentTable } from "common/types";
import { db } from "db";
import { TaskFileStorage } from "server/files";
import { NextContext } from "types/nextjs";

type RouteParams = {
  id: string;
  path: string;
};

export async function GET(_request: NextRequest, context: NextContext<RouteParams>) {
  // Parse the task id and attachment path from the URL
  const taskId = context.params.id;
  const path = context.params.path;

  // Look up in the database which attachment it should be
  let attachment: Pick<TaskAttachmentTable, 'file_hash' | 'mime_type'>;
  try {
    attachment = await db
      .selectFrom("task_attachments")
      .select(["file_hash", "mime_type"])
      .where("id", "=", taskId)
      .where("path", "=", path)
      .executeTakeFirstOrThrow();
  } catch {
    return NextResponse.json({ message: "Not Found" }, { status: 404 })
  }

  // Fetch the blob from TaskFileStorage and load it into memory
  // TODO: Make this part streaming to avoid occupying the memory
  // or use some presigned url shenanigans
  const blob = TaskFileStorage.getBlobClient(attachment.file_hash);
  const buffer = await blob.downloadToBuffer();

  // Send the response out
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': attachment.mime_type,
      'Content-Length': buffer.length.toString(),
    },
  });
}
