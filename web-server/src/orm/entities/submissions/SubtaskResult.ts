import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';

import { Subtask } from '../tasks/Subtask';

import { Result } from './Result';
import { Verdicts } from './types';

@Entity('subtask_results')
export class SubtaskResult {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Result)
  result: Result;

  @Column({ name: 'result_id' })
  resultId: number;

  @ManyToOne(() => Subtask)
  subtask: Subtask;

  @Column({ name: 'subtask_id' })
  subtaskId: number;

  @Column({ type: 'enum', enum: Verdicts })
  verdict: Verdicts;

  @Column({ name: 'running_time' })
  runningTime: number;

  @Column({ name: 'running_memory' })
  runningMemory: number;

  // Must satisfy 0 <= raw_score <= 1
  @Column({ name: 'raw_score' })
  rawScore: number;

  @Column({ name: 'verdict_gotten_at' })
  @CreateDateColumn()
  verdictGottenAt: Date;
}
