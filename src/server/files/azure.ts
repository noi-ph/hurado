import { BlobDownloadResponseParsed, BlobServiceClient, BlobUploadCommonResponse, ContainerClient, ContainerCreateIfNotExistsResponse } from "@azure/storage-blob";
import { AZURE_STORAGE_CONNECTION_STRING } from "../secrets";
import { FileStorageClients, FileStorage } from "./abstract";

class AzureFileStorage implements FileStorage {
  storage: ContainerClient;

  constructor(client: BlobServiceClient, container: string) {
    this.storage = client.getContainerClient(container);
  }

  async uploadFromBuffer(filename: string, buffer: Buffer): Promise<BlobUploadCommonResponse> {
    const blobClient = this.storage.getBlockBlobClient(filename);
    return await blobClient.uploadData(buffer);
  }

  async downloadToBuffer(filename: string): Promise<Buffer> {
    const blob = this.storage.getBlobClient(filename);
    const buffer = await blob.downloadToBuffer();
    return buffer;
  }

  async downloadToFile(filename: string, destination: string): Promise<BlobDownloadResponseParsed> {
    const client = this.storage.getBlobClient(filename);
    return await client.downloadToFile(destination);
  }

  async createIfNotExists(): Promise<ContainerCreateIfNotExistsResponse> {
    return await this.storage.createIfNotExists();
  }
};

export function makeStorageClientsAzure(): FileStorageClients<AzureFileStorage> {
  const TASK_FILE_CONTAINER = 'tasks';
  const SUBMISSION_FILE_CONTAINER = 'submissions';

  const client = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  const TaskFileStorage = new AzureFileStorage(client, TASK_FILE_CONTAINER);
  const SubmissionFileStorage = new AzureFileStorage(client, SUBMISSION_FILE_CONTAINER);

  return {
    TaskFileStorage,
    SubmissionFileStorage,
  };
}
