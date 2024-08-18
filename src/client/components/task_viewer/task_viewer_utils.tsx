import classNames from "classnames";
import { memo } from "react";

type TaskTitleDisplayProps = {
  title: string;
  className?: string;
};

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
