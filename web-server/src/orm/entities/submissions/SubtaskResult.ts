import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

import { Subtask } from '../tasks/Subtask';

import { Result } from './Result';
import { Verdicts } from './types';

@Entity('subtask_results')
export class SubtaskResult {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Result)
  @JoinColumn({ name: 'result_id' })
  result: Result;

  @Column({ name: 'result_id' })
  resultId: number;

  @ManyToOne(() => Subtask)
  @JoinColumn({ name: 'subtask_id' })
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

  @CreateDateColumn({ name: 'verdict_gotten_at' })
  verdictGottenAt: Date;
}
