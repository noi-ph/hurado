import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne, OneToMany } from "typeorm";

import type { File, Task, TestDataResult } from 'orm/entities';

@Entity('test_data')
export class TestData extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne('Task', (task: Task) => task.testData)
  @JoinColumn({ name: 'task_id' })
  task: Promise<Task>;

  @Column()
  order: number;

  @Column()
  name: string;

  @OneToOne('File') // For now
  @JoinColumn({ name: 'input_file_id' })
  inputFile: Promise<File>;

  @OneToOne('File') // For now
  @JoinColumn({ name: 'output_file_id' })
  outputFile: Promise<File>;

  @OneToOne('File', { nullable: true }) // For now
  @JoinColumn({ name: 'judge_file_id' })
  judgeFile: Promise<File> | null;

  @Column({ name: 'is_sample', default: false})
  isSample: boolean;

  @OneToMany('TestDataResult', (result: TestDataResult) => result.testData)
  results: Promise<TestDataResult[]>;
};
