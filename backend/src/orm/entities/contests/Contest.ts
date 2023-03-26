import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";

import type { User, ContestTask, Participation, Submission } from 'orm/entities';

@Entity('contests')
export class Contest extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne('User', (user: User) => user.contests)
  @JoinColumn({ name: 'owner_id' })
  owner: Promise<User>;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  description: string | null;

  @Column({ name: 'start_time' })
  startTime: Date;

  @Column({ name: 'end_time' })
  endTime: Date;

  @OneToMany('ContestTask', (task: ContestTask) => task.contest)
  tasks: Promise<ContestTask[]>;

  @OneToMany('Participation', (participation: Participation) => participation.contest)
  participations: Promise<Participation[]>;

  @OneToMany('Submission', (submission: Submission) => submission.contest)
  submissions: Promise<Submission[]>;
};
