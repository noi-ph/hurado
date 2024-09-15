import { useCallback } from "react";
import { SubmissionsTable } from "client/components/submissions_table";
import commonStyles from 'client/components/common_editor/common_editor.module.css';
import { TaskSubmissionsCache } from "client/submissions";

type TaskViewerSubmissionsProps = {
  taskId: string;
  cache: TaskSubmissionsCache;
  setCache(cache: TaskSubmissionsCache): void;
};

export const TaskEditorSubmissions = ({ taskId, cache, setCache }: TaskViewerSubmissionsProps) => {
  const loadSubmissions = useCallback(() => {
    return TaskSubmissionsCache.loadTaskSubmissions(taskId).then((next) => {
      setCache(next);
    });
  }, [cache]);

  return (
    <div className={commonStyles.content}>
      <div className="max-w-[64rem] mx-auto mt-4">
        <SubmissionsTable
          loaded={cache.loaded}
          submissions={cache.submissions}
          loadSubmissions={loadSubmissions}
          showUser={true}
        />
      </div>
    </div>
  );
};
