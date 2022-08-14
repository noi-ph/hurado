import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne } from 'typeorm';

import { File } from '../files/File';

import { Task } from './Task';

@Entity('test_data') // already plural
export class TestData {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Task) // many data can belong to one task
  task: Task;

  @Column()
  taskId: number;

  @Column()
  order: number;

  @Column()
  name: string;

  @OneToOne(() => File) // a single i/o pair can only have one input file, and a input file can only belong to one i/o pair (for now)
  inputFile: File;

  @Column()
  inputFileId: number;

  @OneToOne(() => File) // ditto
  outputFile: File;

  @Column()
  outputFileId: number;

  @OneToOne(() => File) // ditto
  judgeFile: File;

  @Column()
  judgeFileId: number;

  @Column({
    default: false,
  })
  isSample: boolean;
}
