import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from "typeorm";

import type { File, Task } from 'orm/entities';

@Entity('task_attachments')
export class TaskAttachment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne('Task', (task: Task) => task.attachments)
  @JoinColumn({ name: 'task_id' })
  task: Promise<Task>;

  /**
   * This is set as OneToOne because we'd rather not do reference counting to 
   * see whether a File instance can be safely deleted due to the possibility of 
   * it being depended upon by many TaskAttachment instances. 
   * 
   * Plus, many File instances could just point at the same contents
   */
  @OneToOne('File')
  @JoinColumn({ name: 'file_id' })
  file: Promise<File>;
};
