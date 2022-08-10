import bcrypt from 'bcryptjs';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

import { Countries } from './types';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  email: string;

  @Column({
    nullable: false,
    unique: true,
  })
  username: string;

  @Column()
  hashedPassword: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column({
    default: false,
  })
  isAdmin: boolean;

  @Column({
    nullable: true,
  })
  school: string;

  @Column({
    default: 'Juan',
  })
  firstName: string;

  @Column({
    default: 'dela Cruz',
  })
  lastName: string;

  @Column({
    type: 'enum',
    enum: Countries,
    default: Countries.PH,
  })
  country: Countries;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  setCountry(country: Countries) {
    if (Object.values(Countries).includes(country)) {
      this.country = country;
    }
  }

  hashPassword() {
    this.hashedPassword = bcrypt.hashSync(this.hashedPassword, 8);
  }

  checkIfPasswordMatch(unencryptedPassword: string) {
    return bcrypt.compareSync(unencryptedPassword, this.hashedPassword);
  }
}
