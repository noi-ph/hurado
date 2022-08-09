import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';

import { File } from '../users/File';

import { Task } from './Task';

@Entity('testData') // already plural
export class testData {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Task) // many data can belong to one task
  taskId: Task;

  @Column()
  order: number;

  @Column()
  name: string;

  @OneToOne(() => File) // a single i/o pair can only have one input file, and a input file can only belong to one i/o pair (for now)
  inputFileId: File;

  @OneToOne(() => File) // ditto
  outputFileId: File;

  @OneToOne(() => File) // ditto
  judgeFileId: File;

  @Column({
    default: false,
  })
  isSample: boolean;
}
