import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';

import { Subtask } from '../tasks/Subtask';

import { Result } from './Result';
import { Verdicts } from './types';

@Entity('subtaskResults')
export class SubtaskResult {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Result)
  result: Result;

  @Column()
  resultId: number;

  @ManyToOne(() => Subtask)
  subtask: Subtask;

  @Column()
  subtaskId: number;

  @Column({
    type: 'enum',
    enum: Verdicts,
  })
  verdict: Verdicts;

  @Column()
  runningTime: number;

  @Column()
  runningMemory: number;

  // Must satisfy 0 <= raw_score <= 1
  @Column()
  rawScore: number;

  @Column()
  @CreateDateColumn()
  verdictGottenAt: Date;
}
