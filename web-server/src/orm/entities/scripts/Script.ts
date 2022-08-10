import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';

import { File } from '../files/File';

@Entity('scripts')
export class Script {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => File)
  file: File;

  @Column()
  fileId: number;

  @Column()
  languageCode: string;

  @Column()
  runtimeArgs: string;
}
