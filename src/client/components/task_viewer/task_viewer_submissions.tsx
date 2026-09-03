import { useCallback, useEffect, useState } from "react";
import { TaskViewerDTO } from "common/types";
import { SubmissionsCache } from "client/submissions";
import { OverallScoreDisplay, SubmissionsTable } from "client/components/submissions_table";
import http from "client/http";
import { APIPath, getAPIPath } from "client/paths";
import { OverallVerdictDisplayDTO } from "common/types/verdicts";
import { TaskViewerTitle } from "./task_viewer_utils";

type TaskViewerSubmissionsProps = {
  task: TaskViewerDTO;
  cache: SubmissionsCache;
};

export const TaskViewerSubmissions = ({ task, cache }: TaskViewerSubmissionsProps) => {
  const [loaded, setLoaded] = useState(cache.loaded);

  const loadSubmissions = useCallback(async () => {
    if (cache.loaded) {
      return cache.submissions;
    }
    const result = await cache.loadUserTaskSubmissions(task.id);
    setLoaded(cache.loaded);
    return result;
  }, [cache, task.id]);

  const [overallVerdict, setOverallVerdict] = useState<OverallVerdictDisplayDTO | undefined>(
    undefined
  );
  useEffect(() => {
    const fetchData = async () => {
      const response = await http.get(
        getAPIPath({
          kind: APIPath.TaskOverallScoreLookup,
          id: task.id,
          contestId: null,
        })
      );
      const overall_verdict = response.data;
      setOverallVerdict(overall_verdict.verdict as OverallVerdictDisplayDTO | undefined);
    };
    fetchData();
  }, [task.id]);

  return (
    <div>
      <div className="flex items-end mt-2 mb-4">
        <TaskViewerTitle title={task.title} />
        <OverallScoreDisplay overallVerdict={overallVerdict} className="ml-auto" />
      </div>
      <SubmissionsTable
        loaded={loaded}
        submissions={cache.submissions}
        loadSubmissions={loadSubmissions}
        showUser={false}
      />
    </div>
  );
};
