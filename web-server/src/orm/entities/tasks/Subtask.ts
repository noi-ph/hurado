import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne, OneToMany } from "typeorm";

import type { Script, Task, SubtaskResult } from 'orm/entities';

@Entity('subtasks')
export class Subtask extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne('Task', (task: Task) => task.subtasks)
  @JoinColumn({ name: 'task_id' })
  task: Promise<Task>;

  @Column()
  order: number;

  @Column({ name: 'score_max' })
  scoreMax: number;

  @OneToOne('Script')
  @JoinColumn({ name: 'scorer_script_id' })
  scorerScript: Promise<Script>;

  @OneToOne('Script')
  @JoinColumn({ name: 'validator_script_id' })
  validatorScript: Promise<Script>;

  @Column('text', { name: 'test_data_pattern', array: true, default: [] })
  testDataPattern: string[];

  @OneToMany('SubtaskResult', (result: SubtaskResult) => result.subtask)
  results: Promise<SubtaskResult[]>;
};
