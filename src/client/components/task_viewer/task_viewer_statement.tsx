import { useSession } from "client/sessions";
import { TaskViewerDTO } from "common/types";
import { LatexDisplay } from "client/components/latex_display";
import { SubmitPanel } from "client/components/submit_panel";
import { TaskViewerTitle } from "./task_viewer_utils";
import { SampleIODisplay } from "../sample_io_display/sample_io_display";

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
        {task.sample_IO.map((sample, idx) => (
          <SampleIODisplay
            key={idx}
            sampleIndex={idx}
            input={sample.input}
            output={sample.output}
            explanation={sample.explanation}
          />
        ))}
      </div>
      {isLoggedIn && <SubmitPanel task={task}/>}
    </>
  );
};
