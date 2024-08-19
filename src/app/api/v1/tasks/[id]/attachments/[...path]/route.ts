import { NextRequest, NextResponse } from "next/server";
import { db } from "db";
import { TaskFileStorage } from "server/files";
import { NextContext } from "types/nextjs";
import { normalizeAttachmentPath } from "common/utils/attachments";

type RouteParams = {
  id: string;
  path: string[];
};

export async function GET(_request: NextRequest, context: NextContext<RouteParams>) {
  // **Note that this is task SLUG and not task id (NextJS problems)**
  // Parse the task slug and attachment path from the URL
  const slug = context.params.id;
  const path = normalizeAttachmentPath(context.params.path.join("/"));

  // Look up in the database which attachment it should be
  const attachment = await db
    .selectFrom("tasks")
    .innerJoin("task_attachments", "task_attachments.task_id", "tasks.id")
    .where("tasks.slug", "=", slug)
    .where("task_attachments.path", "=", path)
    .select(["task_attachments.file_hash", "task_attachments.mime_type"])
    .executeTakeFirst();

  if (attachment == null) {
    return NextResponse.json({ message: "Not Found" }, { status: 404 });
  }

  // Fetch the blob from TaskFileStorage and load it into memory
  // TODO(Bonus): Make this part streaming to avoid occupying the memory
  // or use some presigned url shenanigans
  const blob = TaskFileStorage.getBlobClient(attachment.file_hash);
  const buffer = await blob.downloadToBuffer();

  // Send the response out
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": attachment.mime_type,
      "Content-Length": buffer.length.toString(),
    },
  });
}
