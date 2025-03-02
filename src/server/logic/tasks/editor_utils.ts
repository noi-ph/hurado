import { Selectable } from "kysely";
import { TaskDataTable } from "common/types";
import { TaskDataBatchDTO, TaskDataCommunicationDTO, TaskDataOutputDTO } from "common/validation/task_validation";

type TaskDataDatabaseResponseKey =
  | 'id'
  | 'name'
  | 'input_file_name'
  | 'input_file_hash'
  | 'judge_file_name'
  | 'judge_file_hash';

type TaskDataDatabaseResponse = Pick<Selectable<TaskDataTable>, TaskDataDatabaseResponseKey>;

export function dbToTaskDataBatchDTO(data: TaskDataDatabaseResponse): TaskDataBatchDTO {
  return {
    id: data.id,
    name: data.name,
    input_file_name: data.input_file_name as string,
    input_file_hash: data.input_file_hash as string,
    judge_file_name: data.judge_file_name,
    judge_file_hash: data.judge_file_hash,
  };
};

export function dbToTaskDataCommunicationDTO(data: TaskDataDatabaseResponse): TaskDataCommunicationDTO {
  return dbToTaskDataBatchDTO(data);
};

export function dbToTaskDataOutputDTO(data: TaskDataDatabaseResponse): TaskDataOutputDTO {
  return {
    id: data.id,
    name: data.name,
    judge_file_name: data.judge_file_name,
    judge_file_hash: data.judge_file_hash,
  };
};
