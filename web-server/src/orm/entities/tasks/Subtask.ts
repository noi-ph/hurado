import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

import { Script } from '../scripts/Script';

import { Task } from './Task';

// IMPORTANT: TO-DO still lacking validation

@Entity('subtasks')
export class Subtask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Task) // many subtasks can belong to one task
  task: Task;

  @Column()
  taskId: number;

  @Column()
  order: number;

  @Column()
  scoreMax: number;

  @ManyToOne(() => Script)
  scorerScript: Script;

  @Column()
  scorerScriptId: number;

  @ManyToOne(() => Script)
  validatorScript: Script;

  @Column({
    nullable: true,
  })
  validatorScriptId: number;

  @Column()
  testDataPattern: string; // NOTE: would have done an Array but not supported on our postgres apparently
}
