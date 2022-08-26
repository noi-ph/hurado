import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn } from "typeorm";

import { Verdicts } from 'orm/entities/enums';
import type { Submission } from 'orm/entities';

@Entity('results')
export class Result extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne('Submission')
  @JoinColumn({ name: 'submission_id' })
  submission: Promise<Submission>;

  @Column('enum', { enum: Verdicts })
  verdict: Verdicts;

  @Column({ name: 'running_time' })
  runningTime: number;

  @Column({ name: 'running_memory' })
  runningMemory: number;

  // from instructions: computed as sum of SubtaskResult scaled_scores divided by Task.score_max-- Must satisfy 0 <= raw_score <= 1
  @Column({ name: 'raw_score' })
  rawScore: number;

  @Column({ name: 'is_official' })
  isOfficial: boolean;

  @Column({ name: 'compile_time' })
  compileTime: number;

  @Column({ name: 'compile_memory' })
  compileMemory: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'verdict_gotten_at' })
  verdictGottenAt: Date;
};
