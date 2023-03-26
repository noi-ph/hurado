import Link from 'next/link';

type TaskViewerProps = {
  id: number;
  title: string;
  slug: string;
};

export const TaskViewer = (props: TaskViewerProps) => (
  <div>
    <Link href={`/tasks/${props.id}/${props.slug}`}>
      <a>
        {props.id}: {props.title} ({props.slug})
      </a>
    </Link>
  </div>
);
