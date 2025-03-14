import { BlobDownloadResponseParsed, BlobServiceClient, BlobUploadCommonResponse, ContainerClient, ContainerCreateIfNotExistsResponse } from "@azure/storage-blob";
import { AZURE_STORAGE_CONNECTION_STRING, MAX_LOCAL_FILE_CACHE_MB } from "../secrets";
import { FileStorageClients, FileStorage } from "./abstract";
import { promises as fsPromises } from "fs";


class AzureFileStorage extends FileStorage {
  storage: ContainerClient;

  constructor(client: BlobServiceClient, container: string, maxCacheSizeMB: number = 0) {
    super(maxCacheSizeMB);
    this.storage = client.getContainerClient(container);
  }

  async uploadFromBuffer(filename: string, buffer: Buffer): Promise<BlobUploadCommonResponse> {
    const blobClient = this.storage.getBlockBlobClient(filename);
    const resp = await blobClient.uploadData(buffer);
    // Cache the uploaded file
    try {
      await this.cache.putBuffer('azure', this.storage.containerName, filename, buffer);
    } catch (error) {
      console.error('Error caching file:', error);
      // Continue even if caching fails
    }
    return resp;
  }

  async downloadToBuffer(filename: string): Promise<Buffer> {
    // Try to get from cache first
    const cachedPath = await this.cache.get('azure', this.storage.containerName, filename);
    if (cachedPath) {
      return await fsPromises.readFile(cachedPath);
    }
    
    // Not in cache, download from Azure
    const blob = this.storage.getBlobClient(filename);
    const buffer = await blob.downloadToBuffer();
    
    // Cache the downloaded buffer
    try {
      await this.cache.putBuffer('azure', this.storage.containerName, filename, buffer);
    } catch (error) {
      console.error('Error caching file:', error);
      // Continue even if caching fails
    }
    
    return buffer;
  }

  async downloadToFile(filename: string, destination: string): Promise<BlobDownloadResponseParsed> {
    // Try to get from cache first
    const cachedPath = await this.cache.get('azure', this.storage.containerName, filename);
    if (cachedPath) {
      await fsPromises.copyFile(cachedPath, destination);
      return { _response: { status: 200 } } as BlobDownloadResponseParsed;
    }
    
    // Not in cache, download from Azure
    const client = this.storage.getBlobClient(filename);
    const result = await client.downloadToFile(destination);
    
    // Cache the downloaded file
    try {
      await this.cache.put('azure', this.storage.containerName, filename, destination);
    } catch (error) {
      console.error('Error caching file:', error);
      // Continue even if caching fails
    }
    
    return result;
  }

  async createIfNotExists(): Promise<ContainerCreateIfNotExistsResponse> {
    return await this.storage.createIfNotExists();
  }
};

export function makeStorageClientsAzure(): FileStorageClients<AzureFileStorage> {
  const TASK_FILE_CONTAINER = 'tasks';
  const SUBMISSION_FILE_CONTAINER = 'submissions';

  const client = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  const TaskFileStorage = new AzureFileStorage(client, TASK_FILE_CONTAINER, MAX_LOCAL_FILE_CACHE_MB);
  const SubmissionFileStorage = new AzureFileStorage(client, SUBMISSION_FILE_CONTAINER, MAX_LOCAL_FILE_CACHE_MB);

  return {
    TaskFileStorage,
    SubmissionFileStorage,
  };
}
