// Magic words to prevent importing this file from client-side files
import "server-only";

function parseUploadStorageProvider(): "azure" | "aws" {
  if (process.env.UPLOAD_STORAGE_PROVIDER !== "azure" && process.env.UPLOAD_STORAGE_PROVIDER !== "aws") {
    throw new Error("UPLOAD_STORAGE_PROVIDER must be 'azure' or 'aws'");
  }
  return process.env.UPLOAD_STORAGE_PROVIDER;
}

function parseEmailProvider(): "console" | "ses" {
  if (process.env.EMAIL_PROVIDER !== "console" && process.env.EMAIL_PROVIDER !== "ses") {
    throw new Error("EMAIL_PROVIDER must be 'console' or 'ses'");
  }
  return process.env.EMAIL_PROVIDER;
}

export const WEB_ACCESSIBLE_ORIGIN = process.env.WEB_ACCESSIBLE_ORIGIN;

// Maybe have some validation here for various process.env variables
export const JWT_SECRET = process.env.JWT_SECRET!;
export const JWT_EXPIRE = process.env.JWT_EXPIRE!;

export const POSTGRES_HOSTNAME =
  process.env.IS_UNDER_DOCKER === "true"
    ? process.env.DOCKER_POSTGRES_HOSTNAME
    : process.env.POSTGRES_HOSTNAME;

export const KOMPGEN_SECRET = process.env.KOMPGEN_SECRET;

export const POSTGRES_DB = process.env.POSTGRES_DB;
export const POSTGRES_USER = process.env.POSTGRES_USER;
export const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;
export const POSTGRES_PORT = process.env.POSTGRES_PORT ? +process.env.POSTGRES_PORT! : 5432;

export const REDIS_HOST = process.env.REDIS_HOST!;
export const REDIS_PORT = +process.env.REDIS_PORT!;

export const UPLOAD_STORAGE_PROVIDER = parseUploadStorageProvider();

export const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING!;

export const AWS_S3_ENDPOINT = process.env.AWS_S3_ENDPOINT!;
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID!;
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY!;
export const AWS_REGION = process.env.AWS_REGION!;
export const AWS_UPLOAD_BUCKET = process.env.AWS_UPLOAD_BUCKET!;

export const EMAIL_PROVIDER = parseEmailProvider();

export const AWS_SES_ACCESS_KEY_ID = process.env.AWS_SES_ACCESS_KEY_ID!;
export const AWS_SES_SECRET_ACCESS_KEY = process.env.AWS_SES_SECRET_ACCESS_KEY!;
export const AWS_SES_REGION = process.env.AWS_SES_REGION!;

// File cache configuration
export const MAX_LOCAL_FILE_CACHE_MB = process.env.MAX_LOCAL_FILE_CACHE_MB 
  ? parseInt(process.env.MAX_LOCAL_FILE_CACHE_MB, 10) 
  : 0; // Default to 0 (disabled) if not set
