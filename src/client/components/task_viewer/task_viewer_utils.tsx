import classNames from "classnames";
import { memo } from "react";

type TaskTitleDisplayProps = {
  title: string;
  className?: string;
};

// eslint-disable-next-line react/display-name -- pre-existing error before eslint inclusion
export const TaskViewerTitle = memo(({ title, className }: TaskTitleDisplayProps) => {
  return (
    <div
      className={classNames(
        "font-sans font-bold text-4xl mt-2 mb-4",
        title ? "text-blue-400" : "text-gray-300",
        className
      )}
    >
      {title || "Title"}
    </div>
  );
});

type TaskDetailsDisplayProps = {
  time_limit_ms: number | null;
  memory_limit_byte: number | null;
  className?: string;
};

// eslint-disable-next-line react/display-name -- pre-existing error before eslint inclusion
export const TaskViewerDetails = memo(
  ({ time_limit_ms, memory_limit_byte, className }: TaskDetailsDisplayProps) => {
    return (
      <>
        {time_limit_ms == null ? null : (
          <div>
            <span className={classNames("font-sans font-bold mt-2 mb-4", className)}>
              Time Limit:
            </span>
            {` ${time_limit_ms / 1000} seconds`}
          </div>
        )}
        {memory_limit_byte == null ? null : (
          <div>
            <span className={classNames("font-sans font-bold mt-2 mb-4", className)}>
              Memory Limit:
            </span>
            {` ${(memory_limit_byte / 1000000).toLocaleString([], { maximumFractionDigits: 0 })} MB`}
          </div>
        )}
      </>
    );
  }
);
