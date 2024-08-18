import { AxiosResponse } from "axios";
import http from "client/http";
import { APIPath, getAPIPath } from "client/paths";
import { SubmissionSummaryDTO } from "common/types/submissions";


export class TaskSubmissionsCache {
  loaded: boolean;
  submissions: SubmissionSummaryDTO[];

  constructor(loaded: boolean, submissions: SubmissionSummaryDTO[]) {
    this.loaded = loaded;
    this.submissions = submissions;
  }

  static async loadUserTaskSubmissions(taskId: string): Promise<TaskSubmissionsCache> {
    const url = getAPIPath({ kind: APIPath.UserSubmissions, taskId });
    return TaskSubmissionsCache.loadAndCoerce(url);
  }

  static async loadTaskSubmissions(taskId: string): Promise<TaskSubmissionsCache> {
    const url = getAPIPath({ kind: APIPath.TaskSubmissions, id: taskId });
    return TaskSubmissionsCache.loadAndCoerce(url);
  }

  static empty() {
    return new TaskSubmissionsCache(false, []);
  }

  private static async loadAndCoerce(url: string): Promise<TaskSubmissionsCache> {
    const response: AxiosResponse<SubmissionSummaryDTO[]> = await http.get(url);
    const coerced: SubmissionSummaryDTO[] = response.data.map(json => ({
      id: json.id,
      language: json.language,
      username: json.username,
      created_at: new Date(json.created_at),
      verdict_id: json.verdict_id,
      verdict: json.verdict,
      score: json.score,
      running_time_ms: json.running_time_ms,
      running_memory_byte: json.running_memory_byte,
    }));
    return new TaskSubmissionsCache(true, coerced);
  }
}
