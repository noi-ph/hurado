import { BlobServiceClient } from "@azure/storage-blob";
import { AZURE_STORAGE_CONNECTION_STRING } from "./secrets";

export const TASK_FILE_CONTAINER = 'tasks';
export const SUBMISSION_FILE_CONTAINER = 'tasks';

const StorageClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
export const TaskFileStorage = StorageClient.getContainerClient(TASK_FILE_CONTAINER);
