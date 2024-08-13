import { TaskFileUploadRequest } from "common/types";
import { FileStorageKind, FileUploadResponse } from "common/types/files";
import { generateUUIDv4 } from "common/utils/uuid";
import { NextRequest, NextResponse } from "next/server";
import { canManageTasks } from "server/authorization";
import { StorageS3 } from "server/files/storage_s3";
import { getSession } from "server/sessions";

type RouteParams = {
  id: string;
};

type NextContext<Params> = {
  params: Params;
};

export async function POST(request: NextRequest, context: NextContext<RouteParams>) {
  const session = getSession(request);
  // TODO: Validate that this user can manage this task
  if (!canManageTasks(session)) {
    return NextResponse.json({}, { status: 401 });
  }

  const uuid = generateUUIDv4();
  const path = `/tasks/${context.params.id}/${uuid}`;

  const storage = new StorageS3();
  const url = await storage.getPresignedURL(path);
  const response: FileUploadResponse = {
    store: FileStorageKind.S3,
    url,
  };
  return NextResponse.json(response);
}
