import React from "react";

import Link from "next/link";

type TaskViewerProps = {
  id: number;
  title: string;
  slug: string;
};

const TaskViewer = (props: TaskViewerProps) => {
  return (
    <div>
      <Link href={`/tasks/${props.id}/${props.slug}`}>
        <a>
          {props.id}: {props.title} ({props.slug})
        </a>
      </Link>
      <br />
    </div>
  );
};

export { TaskViewer };
