import { NextRequest, NextResponse } from "next/server";
import { db } from "db";
import { TaskFileStorage } from "server/files";
import { NextContext } from "types/nextjs";
import { canManageContests, canManageTasks } from "server/authorization";
import { getSession } from "server/sessions";

type RouteParams = {
  hash: string;
  filename: string;
};

export async function GET(request: NextRequest, context: NextContext<RouteParams>) {
  // Parse the task slug and filename from the URL
  const hash = context.params.hash;
  const filename = context.params.filename;

  // There's no way to limit access to files. All we keep track of is their hash and size.
  // If someone knows the hash of a file, they might as well know the file itself.
  const session = await getSession(request);
  const isAdmin =
    canManageTasks(session) || canManageContests(session) || canManageContests(session);

  if (!isAdmin) {
    return NextResponse.json({}, { status: 403 });
  }

  const file = await db.selectFrom("files").where("hash", "=", hash).executeTakeFirst();

  if (file == null) {
    return NextResponse.json({ message: "Not Found" }, { status: 404 });
  }

  // Fetch the blob from TaskFileStorage and load it into memory
  // TODO(Bonus): Make this part streaming to avoid occupying the memory
  // or use some presigned url shenanigans
  const buffer = await TaskFileStorage.downloadToBuffer(hash);

  // Send the response out
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": buffer.length.toString(),
    },
  });
}
