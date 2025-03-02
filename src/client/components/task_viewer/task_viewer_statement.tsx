import { useSession } from "client/sessions";
import { TaskViewerDTO } from "common/types";
import { LatexDisplay } from "client/components/latex_display";
import { SubmitPanel } from "client/components/submit_panel";
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
import { TaskType } from "common/types/constants";
import { SampleIODisplay } from "../sample_io_display/sample_io_display";
import { TaskViewerDetails, TaskViewerTitle } from "./task_viewer_utils";

type TaskViewerStatementProps = {
  task: TaskViewerDTO;
};

export const TaskViewerStatement = ({ task }: TaskViewerStatementProps) => {
  const session = useSession();
  const isLoggedIn = session != null && session.user != null;
  return (
    <>
      <TaskViewerTitle title={task.title}/>
      <TaskViewerDetails time_limit_ms={task.time_limit_ms} memory_limit_byte={task.memory_limit_byte}/>
      <div className="text-gray-800 my-4">
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
      {isLoggedIn && <SubmitPanel task={task} />}
    </>
  );
};
