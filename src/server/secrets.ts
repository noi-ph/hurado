// Magic words to prevent importing this file from client-side files
import "server-only";

// Maybe have some validation here for various process.env variables
export const JWT_SECRET = process.env.JWT_SECRET!;
export const JWT_EXPIRE = process.env.JWT_EXPIRE!;

export const POSTGRES_HOSTNAME =
  process.env.IS_UNDER_DOCKER === "true"
    ? process.env.DOCKER_POSTGRES_HOSTNAME
    : process.env.POSTGRES_HOSTNAME;

export const POSTGRES_DB = process.env.POSTGRES_DB;
export const POSTGRES_USER = process.env.POSTGRES_USER;
export const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;
export const POSTGRES_PORT = +process.env.POSTGRES_PORT!;

export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
export const AWS_REGION = process.env.AWS_REGION;
export const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
