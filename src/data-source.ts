import { DataSource } from 'typeorm';
import { Lexicon } from './vocabulary/lexicon/lexicon.entity';
import { TranslationStats } from './translation/translation-stats.entity';
import { Translation } from './translation/translation.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgre',
  database: 'vocabulary_service',
  entities: [Lexicon, TranslationStats, Translation],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
	migrationsRun: false
});
