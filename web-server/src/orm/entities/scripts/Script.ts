import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';

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

export function createScript(args: { file: File; languageCode: string; runtimeArgs: string }) {
  const script = new Script();
  script.file = Promise.resolve(args.file);
  script.languageCode = args.languageCode;
  script.runtimeArgs = args.runtimeArgs;
  return script;
}
