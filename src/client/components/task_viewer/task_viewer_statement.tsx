import { MathJax } from "better-react-mathjax";
import { useSession } from "client/sessions";
import { TaskViewerDTO } from "common/types";
import { SubmitComponent } from "../submit";
import { TaskViewerTitle } from "./task_viewer_utils";

type TaskViewerStatementProps = {
  task: TaskViewerDTO;
};

export const TaskViewerStatement = ({ task }: TaskViewerStatementProps) => {
  const session = useSession();
  const isLoggedIn = session != null && session.user != null;

  return (
    <>
      <TaskViewerTitle title={task.title} />
      <div className="my-4">
        <MathJax>{task.statement}</MathJax>
      </div>
      {isLoggedIn && <SubmitComponent taskId={task.id} />}
    </>
  );
};
