import { Readable } from "stream";
import { createWriteStream, promises as fsPromises } from "fs";
import {
  S3,
  HeadBucketCommand,
  CreateBucketCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import {
  AWS_S3_ENDPOINT,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  AWS_UPLOAD_BUCKET,
  MAX_LOCAL_FILE_CACHE_MB,
} from "../secrets";
import { FileStorage, FileStorageClients } from "./abstract";

class S3FileStorage extends FileStorage {
  s3: S3;
  bucket: string;
  prefix: string;

  constructor(s3: S3, bucket: string, prefix: string, maxCacheSizeMB = 0) {
    super(maxCacheSizeMB);
    this.s3 = s3;
    this.bucket = bucket;
    this.prefix = prefix;
  }

  private getFilename(filename: string) {
    return `${this.prefix}/${filename}`;
  }

  async uploadFromBuffer(filename: string, buffer: Buffer) {
    const params = {
      Bucket: this.bucket,
      Key: this.getFilename(filename),
      Body: buffer,
    };
    const resp = await this.s3.send(new PutObjectCommand(params));

    // Cache the uploaded file
    try {
      await this.cache.putBuffer("s3", this.bucket, filename, buffer);
    } catch (error) {
      console.error("Error caching file:", error);
      // Continue even if caching fails
    }
    return resp;
  }

  async downloadToBuffer(filename: string): Promise<Buffer> {
    const prefixed = this.getFilename(filename);

    // Try to get from cache first
    const cachedPath = await this.cache.get("s3", this.bucket, prefixed);
    if (cachedPath) {
      return await fsPromises.readFile(cachedPath);
    }

    // Not in cache, download from S3
    const params = {
      Bucket: this.bucket,
      Key: prefixed,
    };
    const data = await this.s3.send(new GetObjectCommand(params));
    const stream = data.Body as Readable;
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    // Cache the downloaded buffer
    try {
      await this.cache.putBuffer("s3", this.bucket, prefixed, buffer);
    } catch (error) {
      console.error("Error caching file:", error);
      // Continue even if caching fails
    }

    return buffer;
  }

  async downloadToFile(filename: string, destination: string): Promise<unknown> {
    const prefixed = this.getFilename(filename);

    // Try to get from cache first
    const cachedPath = await this.cache.get("s3", this.bucket, prefixed);
    if (cachedPath) {
      await fsPromises.copyFile(cachedPath, destination);
      return;
    }

    // Not in cache, download from S3
    const params = {
      Bucket: this.bucket,
      Key: prefixed,
    };

    const data = await this.s3.send(new GetObjectCommand(params));
    const body = data.Body as Readable;
    if (body == null) {
      throw new Error(`Missing file '${prefixed}'`);
    }

    const result = await new Promise<void>((resolve, reject) => {
      body
        .pipe(createWriteStream(destination))
        .on("error", (err) => reject(err))
        .on("close", () => resolve());
    });

    // Cache the downloaded file
    try {
      await this.cache.put("s3", this.bucket, prefixed, destination);
    } catch (error) {
      console.error("Error caching file:", error);
      // Continue even if caching fails
    }

    return result;
  }

  async createIfNotExists() {
    const params = {
      Bucket: this.bucket,
    };

    try {
      await this.s3.send(new HeadBucketCommand(params));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- pre-existing error before eslint inclusion
    } catch (err: any) {
      if (err.name === "NotFound") {
        await this.s3.send(new CreateBucketCommand(params));
      } else {
        throw err;
      }
    }
  }
}

export function makeStorageClientsS3(): FileStorageClients<S3FileStorage> {
  const TASK_FILE_PREFIX = "tasks";
  const SUBMISSION_FILE_PREFIX = "submissions";

  const s3 = new S3({
    forcePathStyle: true,
    tls: false,
    endpoint: AWS_S3_ENDPOINT,
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  });

  const TaskFileStorage = new S3FileStorage(
    s3,
    AWS_UPLOAD_BUCKET,
    TASK_FILE_PREFIX,
    MAX_LOCAL_FILE_CACHE_MB
  );
  const SubmissionFileStorage = new S3FileStorage(
    s3,
    AWS_UPLOAD_BUCKET,
    SUBMISSION_FILE_PREFIX,
    MAX_LOCAL_FILE_CACHE_MB
  );

  return {
    TaskFileStorage,
    SubmissionFileStorage,
  };
}
