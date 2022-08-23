import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';

import { File } from '../files/File';

import { Submission } from './Submission';

// Files included in a submission.
// Usually just one file, but can be multiple (e.g. output only tasks)

@Entity('submission_files')
export class SubmissionFile {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Submission) // many SubmissionFile for one Submission (for multiple files) - not sure about this tbh
  @JoinColumn({ name: 'submission_id' })
  submission: Submission;

  @Column({ name: 'submission_id' })
  submissionId: number;

  @OneToOne(() => File) // a File can only belong to one SubmissionFile and vice versa
  @JoinColumn({ name: 'file_id' })
  file: File;

  @Column({ name: 'file_id' })
  fileId: number;

  constructor(file: File, submission: Submission) {
    this.file = file;
    this.submission = submission;
  }
}
