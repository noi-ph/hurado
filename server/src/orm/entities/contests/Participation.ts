import bcrypt from 'bcryptjs';
import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";

import { User, Contest } from "orm/entities";

@Entity('participations')
export class Participation extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne('User', (user: User) => user.participations)
  @JoinColumn({ name: 'user_id' })
  user: Promise<User>;

  @ManyToOne('Contest', (contest: Contest) => contest.participations)
  @JoinColumn({ name: 'contest_id' })
  contest: Promise<Contest>;

  @Column({ name: 'is_hidden' })
  isHidden: boolean;

  @Column({ name: 'is_unrestricted' })
  isUnrestricted: boolean;

  @Column({ name: 'hashed_password', nullable: true })
  private hashedPassword: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  setPassword(password: string) {
    this.hashedPassword = bcrypt.hashSync(password);
  }

  checkIfPasswordMatch(unencryptedPassword: string) {
    return bcrypt.compareSync(unencryptedPassword, this.hashedPassword);
  }
};
