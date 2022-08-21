import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('files')
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ name: 'file_url' })
  fileUrl: string;
}
