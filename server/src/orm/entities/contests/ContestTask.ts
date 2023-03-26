import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";

import type { Contest, Task } from 'orm/entities';

@Entity('contest_tasks')
export class ContestTask extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne('Contest', (contest: Contest) => contest.tasks)
  @JoinColumn({ name: 'contest_id' })
  contest: Promise<Contest>;

  @ManyToOne('Task', (task: Task) => task.appearsIn)
  @JoinColumn({ name: 'task_id' })
  task: Promise<Task>;

  @Column()
  letter: string;

  @Column()
  order: number;
};
