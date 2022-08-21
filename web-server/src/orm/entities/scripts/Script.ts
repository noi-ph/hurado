import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';

import { File } from '../files/File';

@Entity('scripts')
export class Script {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => File)
  file: File;

  @Column({ name: 'file_id' })
  fileId: number;

  @Column({ name: 'language_code' })
  languageCode: string;

  @Column({ name: 'runtime_args' })
  runtimeArgs: string;
}
