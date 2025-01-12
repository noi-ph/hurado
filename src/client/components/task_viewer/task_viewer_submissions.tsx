import { useCallback, useEffect, useState } from "react";
import { TaskViewerDTO } from "common/types";
import { TaskSubmissionsCache } from "client/submissions";
import { TaskViewerTitle } from "./task_viewer_utils";
import { OverallScoreDisplay, SubmissionsTable } from "client/components/submissions_table";
import http from "client/http";
import { APIPath, getAPIPath } from "client/paths";
import { OverallVerdictDisplayDTO } from "common/types/verdicts";

type TaskViewerSubmissionsProps = {
  task: TaskViewerDTO;
  cache: TaskSubmissionsCache;
  setCache(cache: TaskSubmissionsCache): void;
};

export const TaskViewerSubmissions = ({ task, cache, setCache }: TaskViewerSubmissionsProps) => {
  const loadSubmissions = useCallback(() => {
    return TaskSubmissionsCache.loadUserTaskSubmissions(task.id).then((next) => {
      setCache(next);
    });
  }, [cache]);
  
  const [overallVerdict, setOverallVerdict] = useState<OverallVerdictDisplayDTO | undefined>(undefined);
  useEffect(() => {
    const fetchData = async() => {
      const response = await http.get(getAPIPath({
        kind: APIPath.TaskOverallScoreLookup,
        id: task.id,
        contestId: null,
      }));
      const overall_verdict = response.data;
      setOverallVerdict(overall_verdict.verdict as OverallVerdictDisplayDTO | undefined);
    };
    fetchData();
  }, []);

  return (
    <div>
      <div className="flex items-end mt-2 mb-4">
        <TaskViewerTitle title={task.title}/>
        <OverallScoreDisplay overallVerdict={overallVerdict} className="ml-auto"/>
      </div>
      <SubmissionsTable
        loaded={cache.loaded}
        submissions={cache.submissions}
        loadSubmissions={loadSubmissions}
        showUser={false}
      />
    </div>
  );
};
