import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';

import { User } from '../users/User';

import { Task } from './Task';
import { TaskDeveloperRoles } from './types';

// {userId} is the {role} ( with contribution rank {order} ) for problem {taskId}
// ^^ following the instructions

// maybe one user/role pair could list all tasks where the person has such a contribution?
// to reduce database size
// problem would be for the {order}, since it can be different per problem
// and also Arrays aren't compatible with postgres (at least on my end), so not sure how to implement it

@Entity('taskDevelopers')
export class TaskDeveloper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Task) // one task can have many developer attributions
  task: Task;

  @Column()
  taskId: number;

  @ManyToOne(() => User) // one user can have many developer attributions (for different roles)
  user: User;

  @Column()
  userId: number;

  @Column()
  order: number;

  @Column({
    type: 'enum',
    enum: TaskDeveloperRoles,
  })
  role: TaskDeveloperRoles;
}
