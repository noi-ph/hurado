import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('files')
export class File extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  size: number;

  @Column({ name: 'file_url' })
  fileUrl: string;

  constructor(name: string, size: number, fileUrl: string) {
    super();

    this.name = name;
    this.size = size,
    this.fileUrl = fileUrl;
  }
};
