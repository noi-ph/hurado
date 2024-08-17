import { TaskViewerDTO } from "common/types";
import { TaskViewerTitle } from "./task_viewer_utils";

type TaskViewerSubmissionsProps = {
  task: TaskViewerDTO;
};

export const TaskViewerSubmissions = ({ task }: TaskViewerSubmissionsProps) => {
  return (
    <div>
      <TaskViewerTitle title={task.title} />

      Submissions will go here
    </div>
  );
};
