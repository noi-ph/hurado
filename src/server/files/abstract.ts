
export abstract class FileStorage {
  abstract uploadFromBuffer(filename: string, buffer: Buffer): Promise<unknown>;
  abstract downloadToBuffer(filename: string): Promise<Buffer>;
  abstract downloadToFile(filename: string, destination: string): Promise<unknown>;
  abstract createIfNotExists(): Promise<unknown>;
}

export type FileStorageClients<T extends FileStorage> = {
  TaskFileStorage: T;
  SubmissionFileStorage: T;
};
