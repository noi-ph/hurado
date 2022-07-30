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
  password_hash: string;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column({
    default: false
  })
  is_admin: boolean;

  @Column()
  school: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({
    default: 'PH' as Country,
  })
  country: string;
}