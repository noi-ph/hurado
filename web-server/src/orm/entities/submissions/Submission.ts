import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';

import { Task } from '../tasks/Task';
import { User } from '../users/User';

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  owner: User;

  @Column({ name: 'owner_id' })
  ownerId: number;

  // TO-DO: contest  / contestId (nullable)

  @ManyToOne(() => Task)
  task: Task;

  @Column({ name: 'task_id' })
  taskId: number;

  @Column({ name: 'created_at' })
  @CreateDateColumn()
  createdAt: Date;

  @Column({ name: 'language_code' })
  languageCode: string; // could be enum?
}
