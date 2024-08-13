export enum FileStorageKind {
  S3 = 'S3',
}

export type FileUploadResponse = {
  store: FileStorageKind;
  url: string;
};
