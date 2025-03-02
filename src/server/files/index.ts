import { UPLOAD_STORAGE_PROVIDER } from "../secrets";
import { FileStorage } from "./abstract";
import { makeStorageClientsAzure } from "./azure";
import { makeStorageClientsS3 } from "./s3";

const clients = UPLOAD_STORAGE_PROVIDER == 'azure'
  ? makeStorageClientsAzure()
  : makeStorageClientsS3();

export const TaskFileStorage: FileStorage = clients.TaskFileStorage;
export const SubmissionFileStorage: FileStorage = clients.SubmissionFileStorage;
