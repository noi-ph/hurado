import { MathJax } from "better-react-mathjax";
import { TaskViewerDTO } from "common/types";
import { SubmitComponent } from "../submit";
import { TaskViewerTitle } from "./task_viewer_utils";

type TaskViewerStatementProps = {
  task: TaskViewerDTO;
};

export const TaskViewerStatement = ({ task }: TaskViewerStatementProps) => {
  return (
    <>
      <TaskViewerTitle title={task.title} />
      <div className='my-4'>
        <MathJax>{task.statement}</MathJax>
      </div>
      <SubmitComponent taskId={task.id}/>
    </>
  );
};
