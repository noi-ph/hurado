import bcrypt from 'bcryptjs';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

import { Country } from './types';

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

  @Column()
  isAdmin: boolean;

  @Column({
    nullable: true,
  })
  school: string;

  @Column({
    nullable: false,
  })
  firstName: string;

  @Column({
    nullable: false,
  })
  lastName: string;

  @Column({
    default: 'PH' as Country,
  })
  country: string;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  setCountry(country: Country) {
    this.country = country;
  }

  hashPassword() {
    this.hashedPassword = bcrypt.hashSync(this.hashedPassword, 8);
  }

  checkIfPasswordMatch(unencryptedPassword: string) {
    return bcrypt.compareSync(unencryptedPassword, this.hashedPassword);
  }
}
