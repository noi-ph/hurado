import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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
}

export function createFile(args: { name: string; contents: Buffer }) {
  const file = new File();
  file.name = args.name;
  file.size = args.contents.byteLength;
  file.contents = args.contents;
  return file;
}
