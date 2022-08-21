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
  name: string;

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
  
  setPassword(password: string) {
    this.hashedPassword = bcrypt.hashSync(password, 8);
  }

  checkIfPasswordMatch(unencryptedPassword: string) {
    return bcrypt.compareSync(unencryptedPassword, this.hashedPassword);
  }
}
