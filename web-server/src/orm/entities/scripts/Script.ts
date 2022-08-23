import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn } from 'typeorm';

import { File } from '../files/File';

@Entity('scripts')
export class Script {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => File)
  @JoinColumn({ name: 'file_id' })
  file: File;

  @Column({ name: 'file_id' })
  fileId: number;

  @Column({ name: 'language_code' })
  languageCode: string;

  @Column({ name: 'runtime_args' })
  runtimeArgs: string;

  constructor(file: File, languageCode: string, runtimeArgs: string) {
    this.file = file;
    this.languageCode = languageCode;
    this.runtimeArgs = runtimeArgs;
  }
}
