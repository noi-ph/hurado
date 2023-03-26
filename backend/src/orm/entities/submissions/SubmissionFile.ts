import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from "typeorm";

import type { File, Submission } from 'orm/entities';

@Entity('submission_files')
export class SubmissionFile extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne('Submission', (submission: Submission) => submission.files)
  @JoinColumn({ name: 'submission_id' })
  submission: Promise<Submission>;

  @OneToOne('File')
  @JoinColumn({ name: 'file_id' })
  file: Promise<File>;

  constructor(file: File, submission: Submission) {
    super();

    this.file = Promise.resolve(file);
    this.submission = Promise.resolve(submission);
  }
};
