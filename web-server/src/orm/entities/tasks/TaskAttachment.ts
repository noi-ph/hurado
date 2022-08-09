import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';

import { File } from '../users/File';

import { Task } from './Task';

@Entity('taskAttachments')
export class TaskAttachment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Task) // many attachments can be related to one Task
  taskId: Task;

  @ManyToOne(() => File) // many attachment instances can all point back to one File
  fileId: File;
}
