import { 
  Entity,
  Check,
  PrimaryGeneratedColumn,
  Column, 
  ManyToOne,
} from 'typeorm';
import { Language } from './types';
import { User } from '../users/User';

@Entity('tasks')
@Check('"slug" ~* ""')  // TODO: make regex recipe
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  slug: string;

  @Column()
  @ManyToOne(type => User, user => user.tasks)
  owner: User;

  @Column({
    nullable: true,
  })
  statement: string;

  @Column({
    default: Language.All,
  })
  language: string;

  @Column()
  taskType: string;

  score_max: number;
};