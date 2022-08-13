import bcrypt from 'bcryptjs';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorArray } from 'utils/response/custom-error/types';

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
    const allowedCharacters = /^[A-Za-z0-9\.\-\_]*$/;
    const hasAlphanumeric = /[A-Za-z0-9]/;
    const errors = new ErrorArray();

    if (!username.match(allowedCharacters)) {
      errors.put('username', 'Username has invalid characters');
    }

    if (!username.match(hasAlphanumeric)) {
      errors.put('username', 'Username must have at least one alphanumeric character');
    }

    if (username.length < 3) {
      errors.put('username', 'Username is too short');
    }

    if (errors.isEmpty) {
      this.username = username;
    } else {
      throw new CustomError(400, 'Validation', 'Username is invalid', null, errors);
    }
  }

  hashPassword() {
    this.hashedPassword = bcrypt.hashSync(this.hashedPassword, 8);
  }

  checkIfPasswordMatch(unencryptedPassword: string) {
    return bcrypt.compareSync(unencryptedPassword, this.hashedPassword);
  }
}
