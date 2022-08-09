import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';

import { User } from '../users/User';

import { Task } from './Task';

// {userId} is the {role} ( with contribution rank {order} ) for problem {taskId}
// ^^ following the instructions

// maybe one user/role pair could list all tasks where the person has such a contribution?
// to reduce database size
// problem would be for the {order}, since it can be different per problem
// and also Arrays aren't compatible with postgres (at least on my end), so not sure how to implement it

export enum Roles {
  Setter = 'Setter',
  StatementAuthor = 'StatementAuthor',
  TestDataAuthor = 'TestDataAuthor',
  Tester = 'Tester',
  Editorialist = 'Editorialist',
  Other = 'Other',
}

@Entity('taskDevelopers')
export class TaskDeveloper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Task) // one task can have many developer attributions
  taskId: Task;

  @ManyToOne(() => User) // one user can have many developer attributions (for different roles)
  userId: User;

  @Column()
  order: number;

  @Column({
    // enum
    type: 'enum',
    enum: Roles,
  })
  role: Roles;
}
