import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';

import { File } from '../files/File';

import { Task } from './Task';

@Entity('test_data') // already plural
export class TestData {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Task) // many data can belong to one task
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @Column({ name: 'task_id' })
  taskId: number;

  @Column()
  order: number;

  @Column()
  name: string;

  @OneToOne(() => File) // a single i/o pair can only have one input file, and a input file can only belong to one i/o pair (for now)
  @JoinColumn({ name: 'input_file_id' })
  inputFile: File;

  @Column({ name: 'input_file_id' })
  inputFileId: number;

  @OneToOne(() => File) // ditto
  @JoinColumn({ name: 'output_file_id' })
  outputFile: File;

  @Column({ name: 'output_file_id' })
  outputFileId: number;

  @OneToOne(() => File) // ditto
  @JoinColumn({ name: 'judge_file_id' })
  judgeFile: File;

  @Column({ name: 'judge_file_id' })
  judgeFileId: number;

  @Column({ default: false, name: 'is_sample' })
  isSample: boolean;
}
