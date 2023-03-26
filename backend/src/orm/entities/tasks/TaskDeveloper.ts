import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";

import { TaskDeveloperRoles } from "orm/entities/enums";
import type { Task, User } from 'orm/entities';

@Entity('task_developers')
export class TaskDeveloper extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne('Task', (task: Task) => task.developers)
  @JoinColumn({ name: 'task_id' })
  task: Promise<Task>;

  @ManyToOne('User', (user: User) => user.develops)
  @JoinColumn({ name: 'user_id' })
  user: Promise<User>;

  @Column()
  order: number;

  @Column('enum', { enum: TaskDeveloperRoles })
  role: TaskDeveloperRoles;
};
