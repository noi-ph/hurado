import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne } from "typeorm";

import { Verdicts } from "orm/entities/enums";
import type { Result, Subtask } from 'orm/entities';

@Entity('subtask_results')
export class SubtaskResult extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne('Result')
  @JoinColumn({ name: 'result_id' })
  result: Promise<Result>;

  @ManyToOne('Subtask', (subtask: Subtask) => subtask.results)
  @JoinColumn({ name: 'subtask_id' })
  subtask: Promise<Subtask>;

  @Column('enum', { enum: Verdicts })
  verdict: Verdicts;

  @Column({ name: 'running_time' })
  runningTime: number;

  @Column({ name: 'running_memory' })
  runningMemory: number;

  // Must satisfy 0 <= raw_score <= 1
  @Column({ name: 'raw_score' })
  rawScore: number;

  @Column({ name: 'verdict_gotten_at' })
  verdictGottenAt: Date;
};
