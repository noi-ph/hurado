import { BlobServiceClient } from "@azure/storage-blob";
import { TASK_FILE_CONTAINER } from "../../server/files";

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING!;

const client = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const container = client.getContainerClient(TASK_FILE_CONTAINER);

container.createIfNotExists();
