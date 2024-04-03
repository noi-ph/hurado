import type { FunctionComponent } from 'react';
import type { Task } from 'lib/models';

import Link from 'next/link';

import styles from './index.module.css';

type props = {
    task: Task
}

export const TaskCard: FunctionComponent<props> = ({ task }) => (
  <Link
    key={task.slug}
    href={`/tasks/${task.slug}`}
    className={styles.container}
  >
    <h2>{ task.title }</h2>
    <p>
      {
            task.description
            ?? 'No description was provided for this task.'
        }
    </p>
  </Link>
);
