import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';

import type {
  User,
  Script,
  TaskAttachment,
  TaskDeveloper,
  TestData,
  ContestTask,
  Submission,
  Subtask,
} from 'orm/entities';
import { AllowedLanguages, TaskType } from 'orm/entities/enums';

@Entity('tasks')
export class Task extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne('User', (user: User) => user.tasks)
  @JoinColumn({ name: 'owner_id' })
  owner: Promise<User>;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  description: string | null;

  @Column()
  statement: string;

  @Column('enum', {
    name: 'allowed_languages',
    enum: AllowedLanguages,
    default: AllowedLanguages.All,
  })
  allowedLanguages: AllowedLanguages;

  @Column('enum', { name: 'task_type', enum: TaskType })
  taskType: TaskType;

  @Column({ name: 'score_max' })
  scoreMax: number;

  @OneToOne('Script')
  @JoinColumn({ name: 'checker_script_id' })
  checkerScript: Promise<Script>;

  @Column({ name: 'time_limit', default: 2 })
  timeLimit: number;

  @Column({
    name: 'memory_limit',
    default: 1099511627776, // 1024GB
  })
  memoryLimit: number;

  @Column({ name: 'compile_time_limit', default: 10 })
  compileTimeLimit: number;

  @Column({
    name: 'compile_memory_limit',
    default: 1099511627776, // 1024GB
  })
  compileMemoryLimit: number;

  @Column({
    name: 'submission_size_limit',
    default: 32768, // 32KB
  })
  submissionSizeLimit: number;

  @OneToOne('Script', { nullable: true })
  @JoinColumn({ name: 'validator_script_id' })
  validatorScript: Promise<Script> | null;

  @Column({ name: 'is_public_in_archive', default: false })
  isPublicInArchive: boolean;

  @OneToMany('TaskAttachment', (attachment: TaskAttachment) => attachment.task)
  attachments: Promise<TaskAttachment[]>;

  @OneToMany('TaskDeveloper', (developer: TaskDeveloper) => developer.task)
  developers: Promise<TaskDeveloper[]>;

  @OneToMany('TestData', (testData: TestData) => testData.task)
  testData: Promise<TestData[]>;

  @OneToMany('ContestTask', (contestTask: ContestTask) => contestTask.task)
  appearsIn: Promise<ContestTask[]>;

  @OneToMany('Submission', (submission: Submission) => submission.task)
  submissions: Promise<Submission[]>;

  @OneToMany('Subtask', (subtask: Subtask) => subtask.task)
  subtasks: Promise<Subtask[]>;
}
