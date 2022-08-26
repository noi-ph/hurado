import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";

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

  constructor(file: File, languageCode: string, runtimeArgs: string) {
    super();

    this.file = Promise.resolve(file);
    this.languageCode = languageCode;
    this.runtimeArgs = runtimeArgs;
  }
};
