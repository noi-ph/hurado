import bcrypt from 'bcryptjs';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

import { CustomError } from 'utils/response/custom-error/CustomError';

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

  setCountry(country: Countries) {
    if (Object.values(Countries).includes(country)) {
      this.country = country;
    }
  }

  setUsername(username: string) {
    const regexAllowedCharacters = /^[A-Za-z0-9\.\-\_]*$/;
    const regexHasAlphanumeric = /[A-Za-z0-9]/;
    if (!username.match(regexAllowedCharacters)) {
      throw new CustomError(400, 'Validation', 'Username is invalid', [
        'Username must contain only A-Z, a-z, 0-9, ., -, _',
      ]);
    }
    if (!username.match(regexHasAlphanumeric)) {
      throw new CustomError(400, 'Validation', 'Username is invalid', [
        'Username must have at least one alphanumeric character',
      ]);
    }
    if (username.length < 3) {
      throw new CustomError(400, 'Validation', 'Username is invalid', ['Username is too short']);
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
