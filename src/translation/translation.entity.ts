import { Lexicon } from 'src/vocabulary/lexicon/lexicon.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { Example } from './example.entity';
import { Grammar } from 'src/grammar/grammar.entity';

@Entity('translations') 
export class Translation {
  @PrimaryGeneratedColumn()
  id: number;

	@ManyToOne(() => Lexicon, (lexicon) => lexicon.translations, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'lexiconId' }) 
	lexicon: Lexicon;

	@Column({ nullable: true })
	lexiconId?: number;

  @Column()
  source: string;

  @Column()
  target: string;

  @Column()
  sourceLang: 'ru' | 'fr' | 'en';

  @Column()
  targetLang: 'ru' | 'fr' | 'en';

  @Column()
  meaning: string;

  @Column({ nullable: true })
  example?: string;

	@OneToMany(() => Example, example => example.translation, { cascade: true, eager: true })
	examples: Example[];

	@OneToOne(() => Grammar, { cascade: true, eager: true, nullable: true })
	@JoinColumn()
	grammar?: Grammar;

}
