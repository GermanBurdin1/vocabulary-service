import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Lexicon } from 'src/vocabulary/lexicon/lexicon.entity';

@Entity()
export class Grammar {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Lexicon, (lexicon) => lexicon.grammar, { onDelete: 'CASCADE' })
  @JoinColumn()
  lexicon: Lexicon;

  @Column()
  partOfSpeech: string;

  @Column({ nullable: true })
  gender?: 'masculine' | 'feminine';

  @Column({ nullable: true })
  number?: 'singular' | 'plural';

  @Column({ nullable: true })
  isProper?: boolean;

  @Column({ nullable: true })
  transitivity?: 'transitive' | 'intransitive';

  @Column({ nullable: true })
  isPronominal?: boolean;

  @Column({ nullable: true })
  isIrregular?: boolean;

  @Column({ nullable: true })
  comparison?: 'positive' | 'comparative' | 'superlative';

  @Column({ nullable: true })
  variable?: boolean;

  @Column({ nullable: true })
  person?: number;

  @Column({ nullable: true })
  type?: string;

  @Column({ nullable: true })
  emotionType?: string;

  @Column({ nullable: true })
  expressionType?: 'idiom' | 'proverb' | 'saying' | 'collocation' | 'quote' | 'other';

  @Column({ nullable: true })
  origin?: string;
}
