import { AxiosResponse } from "axios";
import { createContext } from "react";
import http from "client/http";
import { APIPath, getAPIPath } from "client/paths";
import { SubmissionSummaryDTO } from "common/types/submissions";

export class SubmissionsCache {
  loaded: boolean;
  submissions: SubmissionSummaryDTO[];

  constructor() {
    this.loaded = false;
    this.submissions = [];
  }

  async loadUserTaskSubmissions(taskId: string): Promise<SubmissionSummaryDTO[]> {
    const url = getAPIPath({ kind: APIPath.UserSubmissions, taskId });
    const submissions = await SubmissionsCache.loadAndCoerce(url);
    this.loaded = true;
    this.submissions = submissions;
    return submissions;
  }

  async loadTaskSubmissions(taskId: string): Promise<SubmissionSummaryDTO[]> {
    const url = getAPIPath({ kind: APIPath.TaskSubmissions, id: taskId });
    const submissions = await SubmissionsCache.loadAndCoerce(url);
    this.loaded = true;
    this.submissions = submissions;
    return submissions;
  }

  clear() {
    this.loaded = false;
    this.submissions = [];
  }

  private static async loadAndCoerce(url: string): Promise<SubmissionSummaryDTO[]> {
    const response: AxiosResponse<SubmissionSummaryDTO[]> = await http.get(url);
    const coerced: SubmissionSummaryDTO[] = response.data.map((json) => ({
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
    return coerced;
  }
}

export const SubmissionsCacheContext = createContext<SubmissionsCache | null>(null);
