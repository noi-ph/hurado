import { 
  Entity,
  Check,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Country } from './types';

@Entity('users')
@Check('"username" ~* "[a-zA-Z]+_-\..*[0-9]+"')  // Unverified regex recipe
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
    nullable: false,
  })
  email: string;

  @Column({
    unique: true,
    nullable: false,
  })
  username: string;

  @Column({
    nullable: false,
  })
  passwordHash: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column({
    default: false,
  })
  isAdmin: boolean;

  @Column()
  school: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    default: 'PH' as Country,
  })
  country: string;
}