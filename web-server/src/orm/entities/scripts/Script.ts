import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import type { File } from 'orm/entities/files';

@Entity('scripts')
export class Script extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne('File')
  @JoinColumn({ name: 'file_id' })
  file: Promise<File>;

  @Column({ name: 'language_code' })
  languageCode: string;

  @Column({ name: 'runtime_args' })
  runtimeArgs: string;
}
