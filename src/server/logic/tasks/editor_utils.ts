import { TaskDataTable } from "common/types";
import { TaskDataBatchDTO, TaskDataOutputDTO } from "common/validation/task_validation";
import { Selectable } from "kysely";

type TaskDataDatabaseResponseKey =
  | 'id'
  | 'name'
  | 'is_sample'
  | 'input_file_name'
  | 'input_file_hash'
  | 'judge_file_name'
  | 'judge_file_hash';

type TaskDataDatabaseResponse = Pick<Selectable<TaskDataTable>, TaskDataDatabaseResponseKey>;

export function dbToTaskDataBatchDTO(data: TaskDataDatabaseResponse): TaskDataBatchDTO {
  return {
    id: data.id,
    name: data.name,
    is_sample: data.is_sample,
    input_file_name: data.input_file_name as string,
    input_file_hash: data.input_file_hash as string,
    judge_file_name: data.judge_file_name,
    judge_file_hash: data.judge_file_hash,
  };
};

export function dbToTaskDataOutputDTO(data: TaskDataDatabaseResponse): TaskDataOutputDTO {
  return {
    id: data.id,
    name: data.name,
    judge_file_name: data.judge_file_name,
    judge_file_hash: data.judge_file_hash,
  };
};
