import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('files')
export class File extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  size: number;

  @Column('bytea')
  contents: Buffer;

  constructor(name: string, size: number, contents: Buffer) {
    super();

    this.name = name;
    this.size = size,
    this.contents = contents;
  }
};
