import { useCallback } from "react";
import { SubmissionsTable } from "client/components/submissions_table";
import commonStyles from 'client/components/common_editor/common_editor.module.css';
import { SubmissionsCache } from "client/submissions";


type TaskEditorSubmissionsProps = {
  taskId: string;
  cache: SubmissionsCache;
};

export const TaskEditorSubmissions = ({ taskId, cache }: TaskEditorSubmissionsProps) => {
  const loadSubmissions = useCallback(async () => {
    if (cache.loaded) {
      return cache.submissions;
    }
    return cache.loadTaskSubmissions(taskId);
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
