import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';

import type { Task, User, Contest, Result, SubmissionFile } from 'orm/entities';

@Entity('submissions')
export class Submission extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne('User', (user: User) => user.submissions)
  @JoinColumn({ name: 'owner_id' })
  owner: Promise<User>;

  @ManyToOne('Contest', (contest: Contest) => contest.submissions, { nullable: true })
  @JoinColumn({ name: 'contest_id' })
  contest: Promise<Contest> | null;

  @ManyToOne('Task', (task: Task) => task.submissions)
  @JoinColumn({ name: 'task_id' })
  task: Promise<Task>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'language_code' })
  languageCode: string; // could be enum?
  // TODO: validation to see if this is an accepted task language

  @OneToOne('Result')
  @JoinColumn({ name: 'result_id' })
  result: Promise<Result>;

  @OneToMany('SubmissionFile', (file: SubmissionFile) => file.submission)
  files: Promise<SubmissionFile[]>;

  constructor(owner: User, task: Task, languageCode: string) {
    super();

    this.owner = Promise.resolve(owner);
    this.task = Promise.resolve(task);
    this.languageCode = languageCode;
  }
}
