import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';

import { Task } from './Task';

// IMPORTANT: TO-DO still lacking validation

@Entity('subtasks')
export class Subtask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Task) // many subtasks can belong to one task
  taskId: Task;

  @Column()
  order: number;

  @Column()
  scoreMax: number;

  @Column()
  scorer: string; //Script

  @Column({
    nullable: true,
  })
  validator: string; //Script

  @Column()
  testDataPattern: string; // NOTE: would have done an Array but not supported on our postgres apparently
}
