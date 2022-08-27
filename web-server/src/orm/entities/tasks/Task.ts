import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

import { Script } from '../scripts/Script';
import { User } from '../users/User';

import { AllowedLanguages, Languages, TaskTypes } from './types';

// IMPORTANT: TO-DO still lacking validation

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ name: 'owner_id' })
  ownerId: number;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  statement: string; //please check data type (for LaTeX)

  @Column({ type: 'enum', enum: AllowedLanguages, default: AllowedLanguages.All, name: 'allowed_languages' })
  allowedLanguages: AllowedLanguages;

  @Column({ type: 'enum', enum: TaskTypes, default: TaskTypes.Batch, name: 'task_type' })
  taskType: TaskTypes;

  @Column({ name: 'score_max' })
  scoreMax: number;

  @ManyToOne(() => Script)
  @JoinColumn({ name: 'checker_script_id' })
  checkerScript: Script;

  @Column({ name: 'checker_script_id' })
  checkerScriptId: number;

  @Column({ default: 2, name: 'time_limit' })
  timeLimit: number;

  @Column({
    default: 1099511627776, // 1024GB
    name: 'memory_limit',
  })
  memoryLimit: number;

  @Column({ default: 10, name: 'compile_time_limit' })
  compileTimeLimit: number;

  @Column({
    default: 1099511627776, // 1024GB
    name: 'compile_memory_limit',
  })
  compileMemoryLimit: number;

  @Column({
    default: 32768, // 32KB,
    name: 'submission_size_limit',
  })
  submissionSizeLimit: number;

  @ManyToOne(() => Script)
  @JoinColumn({ name: 'validator_script_id' })
  validatorScript: Script;

  @Column({ name: 'validator_script_id' })
  validatorScriptId: number;

  @Column({ default: false, name: 'is_public_in_archive' })
  isPublicInArchive: boolean; // not sure how to only give admins access to edit

  @Column({ type: 'enum', enum: Languages, default: Languages.English })
  language: Languages;

  setSlug(slug: string) {
    const allowedCharacters = /^[a-z0-9\.\-]*$/;
    const hasDoubleSymbols = /((\.\-)|(\-\.)|(\.\.)|(\-\-))/;
    const hasAlphanumeric = /[a-z0-9]/;

    if (!slug.match(allowedCharacters)) {
      errors.put('slug', 'Slug has invalid characters');
    }

    if (slug.match(hasDoubleSymbols)) {
      errors.put('slug', 'Slug has double symbols');
    }

    if (!slug.match(hasAlphanumeric)) {
      errors.put('slug', 'Slug must have at least one alphanumeric character');
    }

    if (errors.isEmpty) {
      this.slug = slug;
    } else {
      throw new CustomError(400, 'Validation', 'Slug is invalid', null, errors);
    }
  }
}
