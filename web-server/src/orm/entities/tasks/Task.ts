import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';

import { User } from '../users/User';

import { Language } from './types';

// IMPORTANT: TO-DO still lacking validation

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  ownerId: User;

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

  @Column()
  allowedLanguages: string; // PLACEHOLDER DATATYPE

  @Column()
  taskType: string; // PLACEHOLDER DATATYPE

  @Column()
  scoreMax: number;

  @Column()
  checker: string; // please check data type

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

  @Column()
  validator: string; // please check data type

  @Column({
    default: false,
  })
  isPublicInArchive: boolean; // not sure how to only give admins access to edit

  @Column({
    default: 'en-US' as Language,
    length: 15,
  })
  language: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  setLanguage(language: Language) {
    this.language = language;
  }
}
