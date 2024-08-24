"use client";
import { UnreachableError } from "common/errors";
import { TaskViewerDTO } from "common/types";
import { TaskType } from "common/types/constants";
import { SubmitCode } from "./submit_code";
import { SubmitOutput } from "./submit_output";

type SubmitPanelProps = {
  task: TaskViewerDTO;
};

export const SubmitPanel = ({ task }: SubmitPanelProps) => {
  switch (task.type) {
    case TaskType.Batch:
    case TaskType.Communication:
      return <SubmitCode taskId={task.id} />;
    case TaskType.OutputOnly:
      return <SubmitOutput task={task} />;
    default:
      throw new UnreachableError(task);
  }
};
