import { TaskViewerCreditDTO, TaskViewerDTO } from "common/types";
import { TaskViewerTitle } from "./task_viewer_utils";
import styles from "./task_viewer.module.css";

type TaskViewerEditorialProps = {
  task: TaskViewerDTO;
};

export const TaskViewerEditorial = ({ task }: TaskViewerEditorialProps) => {
  return (
    <>
      <TaskViewerTitle title={task.title} className="text-center" />
      <TaskViewerEditorialSection task={task} />
      <TaskViewerCredits task={task} />
    </>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
const TaskViewerEditorialSection = ({ task }: TaskViewerEditorialProps) => {
  return <div className="text-center">No editorials yet!</div>;
};

const TaskViewerCredits = ({ task }: TaskViewerEditorialProps) => {
  return (
    <div className="text-center mt-8">
      <div className="font-mono font-bold text-3xl text-blue-400 mt-2 mb-4">Credits</div>
      <div className={styles.credits}>
        {task.credits.map((credit, idx) => {
          if (isDuplicateCreditRole(task, idx)) {
            return (
              <>
                <div />
                <TaskViewerCreditName credit={credit} />
              </>
            );
          } else {
            return (
              <>
                <TaskViewerCreditRole credit={credit} />
                <TaskViewerCreditName credit={credit} />
              </>
            );
          }
        })}
      </div>
    </div>
  );
};

type TaskViewerCreditEntryProps = {
  credit: TaskViewerCreditDTO;
};

const TaskViewerCreditRole = ({ credit }: TaskViewerCreditEntryProps) => {
  return <div className="font-mono font-bold text-lg text-gray-900 text-start">{credit.role}</div>;
};

const TaskViewerCreditName = ({ credit }: TaskViewerCreditEntryProps) => {
  return <div className="font-mono font-bold text-lg text-blue-400 text-start">{credit.name}</div>;
};

function isDuplicateCreditRole(task: TaskViewerDTO, index: number): boolean {
  if (index == 0) {
    return false;
  }

  const previous = task.credits[index - 1];
  const current = task.credits[index];
  return current.role.trim() == previous.role.trim();
}
