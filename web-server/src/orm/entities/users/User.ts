import { 
  Entity,
  Check,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Country } from './types';
import { Task } from '../tasks/Task'

@Entity('users')
@Check('"username" ~* "[a-zA-Z]+_-\..*[0-9]+"')  // Unverified regex recipe
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  email: string;

  @Column({
    unique: true,
  })
  name: string;

  @Column()
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

  @OneToMany(type => Task, task => task.owner)
  tasks: Task[];
}