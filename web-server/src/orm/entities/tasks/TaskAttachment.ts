import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';

import { File } from '../users/File';

import { Task } from './Task';

@Entity('taskAttachments')
export class taskAttachment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Task) // many attachments can be related to one Task
  taskID: Task;

  @ManyToOne(() => File) // many attachment instances can all point back to one File
  fileID: File;
}
