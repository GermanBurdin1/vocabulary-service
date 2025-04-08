import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('translations') // 👈 важно: это будет связано с таблицей `translations` в БД
export class Translation {
  @PrimaryGeneratedColumn()
  id: number;

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
}
