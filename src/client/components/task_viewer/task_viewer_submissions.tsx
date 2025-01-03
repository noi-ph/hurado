import { useCallback, useContext } from "react";
import { TaskViewerDTO } from "common/types";
import { TaskSubmissionsCache } from "client/submissions";
import { TaskViewerTitle } from "./task_viewer_utils";
import { SubmissionsTable } from "client/components/submissions_table";
import { RefreshSubmissionsContext } from "./task_viewer";

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

  return (
    <div>
      <TaskViewerTitle title={task.title} />
      <SubmissionsTable
        loaded={cache.loaded}
        submissions={cache.submissions}
        loadSubmissions={loadSubmissions}
        showUser={false}
      />
    </div>
  );
};
