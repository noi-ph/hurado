import { InputChangeEvent } from "common/types/events";
import { useCallback } from "react";

export function useTaskUpdater(task, setTask, key) {
  useCallback(
    (event: InputChangeEvent) => {
      setTask({
        ...task,
        [key]: event.target.value,
      });
    },
    [task, setTask]
  );
}
