import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';

import { TestData } from '../tasks/TestData';

import { Result } from './Result';
import { Verdicts } from './types';

@Entity('test_data_results')
export class TestDataResult {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Result)
  result: Result;

  @Column()
  resultId: number;

  @ManyToOne(() => TestData)
  testData: TestData;

  @Column()
  testDataId: number;

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
