import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

import { File } from '../files/File';

import { Task } from './Task';

@Entity('taskAttachments')
export class TaskAttachment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Task) // many attachments can be related to one Task
  task: Task;

  @Column()
  taskId: number;

  @ManyToOne(() => File) // many attachment instances can all point back to one File
  file: File;

  @Column()
  fileId: number;
}
