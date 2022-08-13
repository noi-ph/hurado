import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne } from 'typeorm';

import { Submission } from './Submission';
import { Verdicts } from './types';

@Entity('results')
export class Result {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Submission)
  submission: Submission;

  @Column()
  submissionId: number;

  @Column({
    type: 'enum',
    enum: Verdicts,
  })
  verdict: Verdicts;

  @Column()
  runningTime: number;

  @Column()
  runningMemory: number;

  // from instructions: computed as sum of SubtaskResult scaled_scores divided by Task.score_max-- Must satisfy 0 <= raw_score <= 1
  @Column()
  rawScore: number;

  @Column()
  isOfficial: boolean;

  @Column()
  compileTime: number;

  @Column()
  compileMemory: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @CreateDateColumn()
  verdictGottenAt: Date;
}
