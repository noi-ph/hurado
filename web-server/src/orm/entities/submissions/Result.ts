import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne } from 'typeorm';

import { Submission } from './Submission';
import { Verdicts } from './types';

@Entity('results')
export class Result {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Submission)
  submission: Submission;

  @Column({ name: 'submission_id' })
  submissionId: number;

  @Column({ type: 'enum', enum: Verdicts })
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

  @CreateDateColumn({ name: 'verdict_gotten_at' })
  verdictGottenAt: Date;
}
