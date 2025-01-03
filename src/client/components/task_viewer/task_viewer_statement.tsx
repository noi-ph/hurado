import { useSession } from "client/sessions";
import { TaskViewerDTO } from "common/types";
import { LatexDisplay } from "client/components/latex_display";
import { SubmitPanel } from "client/components/submit_panel";
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
        <LatexDisplay>{task.statement}</LatexDisplay>
      </div>
      {isLoggedIn && <SubmitPanel task={task}/>}
    </>
  );
};
