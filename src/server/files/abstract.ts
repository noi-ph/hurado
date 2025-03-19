import { FileCache } from "./cache";

export abstract class FileStorage {
  protected cache: FileCache;

  constructor(maxCacheSizeMB = 0) {
    this.cache = new FileCache(maxCacheSizeMB);
  }

  abstract uploadFromBuffer(filename: string, buffer: Buffer): Promise<unknown>;
  abstract downloadToBuffer(filename: string): Promise<Buffer>;
  abstract downloadToFile(filename: string, destination: string): Promise<unknown>;
  abstract createIfNotExists(): Promise<unknown>;

  // Method to clear the cache
  async clearCache(): Promise<void> {
    await this.cache.clear();
  }
}

export type FileStorageClients<T extends FileStorage> = {
  TaskFileStorage: T;
  SubmissionFileStorage: T;
};
