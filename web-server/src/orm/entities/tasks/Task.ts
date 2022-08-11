import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

import { CustomError } from 'utils/response/custom-error/CustomError';

import { Script } from '../scripts/Script';
import { User } from '../users/User';

import { AllowedLanguages, Languages, TaskTypes } from './types';

// IMPORTANT: TO-DO still lacking validation

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  owner: User;

  @Column()
  ownerId: number;

  @Column()
  title: string;

  @Column({
    unique: true,
  })
  slug: string;

  @Column({
    nullable: true,
  })
  description: string;

  @Column()
  statement: string; //please check data type (for LaTeX)

  @Column({
    type: 'enum',
    enum: AllowedLanguages,
    default: AllowedLanguages.All,
  })
  allowedLanguages: AllowedLanguages;

  @Column({
    type: 'enum',
    enum: TaskTypes,
    default: TaskTypes.Batch,
  })
  taskType: TaskTypes;

  @Column()
  scoreMax: number;

  @ManyToOne(() => Script)
  checkerScript: Script;

  @Column()
  checkerScriptId: number;

  @Column({
    default: 2,
  })
  timeLimit: number;

  @Column({
    default: 1099511627776, // 1024GB
  })
  memoryLimit: number;

  @Column({
    default: 10,
  })
  compileTimeLimit: number;

  @Column({
    default: 1099511627776, // 1024GB
  })
  compileMemoryLimit: number;

  @Column({
    default: 32768, // 32KB
  })
  submissionSizeLimit: number;

  @ManyToOne(() => Script)
  validatorScript: Script;

  @Column()
  validatorScriptId: number;

  @Column({
    default: false,
  })
  isPublicInArchive: boolean; // not sure how to only give admins access to edit

  @Column({
    type: 'enum',
    enum: Languages,
    default: Languages.English,
  })
  language: Languages;

  setSlug(slug: string) {
    const allowedCharacters = /^[a-z0-9\.\-]*$/;
    const hasDoubleSymbols = /((\.\-)|(\-\.)|(\.\.)|(\-\-))/;
    const atLeastOneAlphanumericCharacter = /[a-z0-9]/;
    if (!slug.match(allowedCharacters)) {
      throw new CustomError(400, 'Validation', 'Invalid slug', ['Slug has invalid characters']);
    }
    if (slug.match(hasDoubleSymbols)) {
      throw new CustomError(400, 'Validation', 'Invalid slug', ['Slug has double symbols']);
    }
    if (!slug.match(atLeastOneAlphanumericCharacter)) {
      throw new CustomError(400, 'Validation', 'Invalid slug', ['Slug must have at least one alphanumeric character']);
    }
    this.slug = slug;
  }
}
