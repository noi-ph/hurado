import bcrypt from 'bcryptjs';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { UserError } from 'utils/Errors';

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
    default: '',
  })
  firstName: string;

  @Column({
    default: '',
  })
  lastName: string;

  @Column({
    type: 'enum',
    enum: Countries,
    default: Countries.PH,
  })
  country: Countries;

  setCountry(country: Countries) {
    if (Object.values(Countries).includes(country)) {
      this.country = country;
    }
  }

  setUsername(username: string) {
    const allowedCharacters = /^[A-Za-z0-9\.\-\_]*$/;
    const hasAlphanumeric = /[A-Za-z0-9]/;
    
    const err: UserError = {};

    if (!username.match(allowedCharacters)) {
      err.username = `Username "${username}" has invalid characters`;
      throw err;
    }

    if (!username.match(hasAlphanumeric)) {
      err.username = `Username "${username}" must have an alphanumeric character`;
      throw err;
    }

    if (username.length < 3) {
      err.username = `Username "${username}" is too short`;
      throw err;
    }

    this.username = username;
  }

  hashPassword() {
    this.hashedPassword = bcrypt.hashSync(this.hashedPassword, 8);
  }

  checkIfPasswordMatch(unencryptedPassword: string) {
    return bcrypt.compareSync(unencryptedPassword, this.hashedPassword);
  }
}
