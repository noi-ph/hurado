import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';

import { Task } from '../tasks/Task';
import { User } from '../users/User';

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  owner: User;

  @Column()
  ownerId: number;

  // TO-DO: contest  / contestId (nullable)

  @ManyToOne(() => Task)
  task: Task;

  @Column()
  taskId: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  languageCode: string; // could be enum?
}
