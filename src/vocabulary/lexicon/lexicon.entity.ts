import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Lexicon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  word: string;

  @Column()
  translated: boolean;

  @Column()
  type: 'word' | 'expression';

  @Column()
  galaxy: string;

  @Column()
  subtopic: string;

  @Column({ type: 'bigint' })
  createdAt: number;
}
