import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne } from "typeorm";

import { Verdicts } from "orm/entities/enums";
import type { TestData, Result } from 'orm/entities';

@Entity('test_data_results')
export class TestDataResult extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne('Result')
  @JoinColumn({ name: 'result_id' })
  result: Promise<Result>;

  @ManyToOne('TestData', (testdata: TestData) => testdata.results)
  @JoinColumn({ name: 'test_data_id' })
  testData: Promise<TestData>;

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
