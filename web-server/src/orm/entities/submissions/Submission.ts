import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

import { Task } from '../tasks/Task';
import { User } from '../users/User';

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ name: 'owner_id' })
  ownerId: number;

  // TO-DO: contest  / contestId (nullable)

  @ManyToOne(() => Task)
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @Column({ name: 'task_id' })
  taskId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'language_code' })
  languageCode: string; // could be enum?

  constructor(ownerId: number, taskId: number, languageCode: string) {
    this.ownerId = ownerId;
    this.taskId = taskId;
    this.languageCode = languageCode;
  }
}
