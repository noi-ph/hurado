import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

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
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @Column({ name: 'task_id' })
  taskId: number;

  @Column()
  order: number;

  @Column({ name: 'score_max' })
  scoreMax: number;

  @ManyToOne(() => Script)
  @JoinColumn({ name: 'scorer_script' })
  scorerScript: Script;

  @Column({ name: 'scorer_script_id' })
  scorerScriptId: number;

  @ManyToOne(() => Script)
  @JoinColumn({ name: 'validator_script_id' })
  validatorScript: Script;

  @Column({ nullable: true, name: 'validator_script_id' })
  validatorScriptId: number;

  @Column({ name: 'test_data_pattern' })
  testDataPattern: string; // NOTE: would have done an Array but not supported on our postgres apparently
}
