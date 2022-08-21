import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

import { TestData } from '../tasks/TestData';

import { Result } from './Result';
import { Verdicts } from './types';

@Entity('test_data_results')
export class TestDataResult {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Result)
  @JoinColumn({ name: 'result_id' })
  result: Result;

  @Column({ name: 'result_id' })
  resultId: number;

  @ManyToOne(() => TestData)
  @JoinColumn({ name: 'test_data_id' })
  testData: TestData;

  @Column({ name: 'test_data_id' })
  testDataId: number;

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
