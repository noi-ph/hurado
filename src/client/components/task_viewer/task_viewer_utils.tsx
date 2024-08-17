import { AxiosResponse } from "axios";
import classNames from "classnames";
import { memo } from "react";
import http from "client/http";
import { APIPath, getAPIPath } from "client/paths";
import { SubmissionSummaryDTO } from "common/types/submissions";

type TaskTitleDisplayProps = {
  title: string;
  className?: string;
};

export const TaskViewerTitle = memo(({ title, className }: TaskTitleDisplayProps) => {
  return (
    <div
      className={classNames(
        "font-sans font-bold text-4xl mt-2 mb-4",
        title ? "text-blue-400" : "text-gray-300",
        className
      )}
    >
      {title || "Title"}
    </div>
  );
});

export class TaskSubmissionsCache {
  loaded: boolean;
  submissions: SubmissionSummaryDTO[];

  constructor(loaded: boolean, submissions: SubmissionSummaryDTO[]) {
    this.loaded = loaded;
    this.submissions = submissions;
  }

  static async load(taskId: string): Promise<TaskSubmissionsCache> {
    const url = getAPIPath({ kind: APIPath.UserSubmissions, taskId });
    const response: AxiosResponse<SubmissionSummaryDTO[]> = await http.get(url);
    const coerced: SubmissionSummaryDTO[] = response.data.map(json => ({
      id: json.id,
      language: json.language,
      created_at: new Date(json.created_at),
      verdict: json.verdict,
      score: json.score,
      running_time_ms: json.running_time_ms,
      running_memory_byte: json.running_memory_byte,
    }));
    return new TaskSubmissionsCache(true, coerced);
  }

  static empty() {
    return new TaskSubmissionsCache(false, []);
  }
}
