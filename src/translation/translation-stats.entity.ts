import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('translation_stats')
export class TranslationStats {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sourceLang: 'ru' | 'fr' | 'en';

  @Column()
  targetLang: 'ru' | 'fr' | 'en';

  @Column({ type: 'varchar' })
  from: 'wiktionary' | 'api' | 'cache';

  @Column({ default: 1 })
  count: number;

  @Column({ type: 'bigint' })
  updatedAt: number;
}
