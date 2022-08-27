import bcrypt from 'bcryptjs';
import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';

import { AppDataSource } from 'orm/data-source';
import type { Task, TaskDeveloper, Submission, Contest, Participation } from 'orm/entities';
import { Countries } from 'orm/entities/enums';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column({ name: 'hashed_password' })
  private hashedPassword: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'is_admin', default: false })
  isAdmin: boolean;

  @Column({ nullable: true })
  school: string | null;

  @Column({ nullable: true })
  name: string | null;

  @Column('enum', { enum: Countries, default: Countries.PH })
  country: Countries;

  @OneToMany('Task', (task: Task) => task.owner)
  tasks: Promise<Task[]>;

  @OneToMany('TaskDeveloper', (taskDeveloper: TaskDeveloper) => taskDeveloper.user)
  develops: Promise<TaskDeveloper[]>;

  @OneToMany('Submission', (submission: Submission) => submission.owner)
  submissions: Promise<Submission[]>;

  @OneToMany('Contest', (contest: Contest) => contest.owner)
  contests: Promise<Contest[]>;

  @OneToMany('Participation', (participation: Participation) => participation.user)
  participations: Promise<Participation[]>;

  setPassword(password: string) {
    this.hashedPassword = bcrypt.hashSync(password);
  }

  checkIfPasswordMatch(unencryptedPassword: string) {
    return bcrypt.compareSync(unencryptedPassword, this.hashedPassword);
  }
}
