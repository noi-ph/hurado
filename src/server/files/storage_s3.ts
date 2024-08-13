import AWS from "aws-sdk";
import {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  AWS_S3_BUCKET_NAME,
} from "server/secrets";

export class StorageS3 {
  s3: AWS.S3;

  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
      region: AWS_REGION,
    });
  }

  async getPresignedURL(path: string): Promise<string> {
    return await this.s3.getSignedUrlPromise("putObject", {
      Bucket: AWS_S3_BUCKET_NAME,
      Key: path,
      Expires: 3600, // URL expires in 60 seconds
    });
  }
}
