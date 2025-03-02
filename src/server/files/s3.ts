import { Readable } from "stream";
import { createWriteStream } from "fs";
import { S3, HeadBucketCommand, CreateBucketCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  AWS_S3_ENDPOINT,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  AWS_UPLOAD_BUCKET,
} from "../secrets";
import { FileStorage, FileStorageClients } from "./abstract";

class S3FileStorage implements FileStorage {
  s3: S3;
  bucket: string;
  prefix: string;

  constructor(s3: S3, bucket: string, prefix: string) {
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
    return await this.s3.send(new PutObjectCommand(params));
  }

  async downloadToBuffer(filename: string): Promise<Buffer> {
    const params = {
      Bucket: this.bucket,
      Key: this.getFilename(filename),
    };
    const data = await this.s3.send(new GetObjectCommand(params));
    const stream = data.Body as Readable;
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  async downloadToFile(filename: string, destination: string): Promise<unknown> {
    const prefixed = this.getFilename(filename);
    const params = {
      Bucket: this.bucket,
      Key: prefixed,
    };

    const data = await this.s3.send(new GetObjectCommand(params));
    const body = data.Body as Readable;
    if (body == null) {
      throw new Error(`Missing file '${prefixed}'`);
    }

    return await new Promise<void>((resolve, reject) => {
      body.pipe(createWriteStream(destination))
        .on('error', err => reject(err))
        .on('close', () => resolve())
    });
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

  const TaskFileStorage = new S3FileStorage(s3, AWS_UPLOAD_BUCKET, TASK_FILE_PREFIX);
  const SubmissionFileStorage = new S3FileStorage(s3, AWS_UPLOAD_BUCKET, SUBMISSION_FILE_PREFIX);

  return {
    TaskFileStorage,
    SubmissionFileStorage,
  };
}
