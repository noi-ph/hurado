// Magic words to prevent importing this file from client-side files
import "server-only";

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
export const POSTGRES_PORT = +process.env.POSTGRES_PORT!;

export const REDIS_HOST = process.env.REDIS_HOST!;
export const REDIS_PORT = +process.env.REDIS_PORT!;

export const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING!;
