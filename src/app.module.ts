import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VocabularyModule } from './vocabulary.module';
import { GptModule } from './vocabulary/gpt/gpt.module';
import { TranslationModule } from './translation/translation.module';
import { LexiconModule } from './vocabulary/lexicon/lexicon.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lexicon } from './vocabulary/lexicon/lexicon.entity';
import { Translation } from './translation/translation.entity';
import { TranslationStats } from './translation/translation-stats.entity';
import { Example } from './translation/example.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: +config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [Lexicon, Translation, TranslationStats, Example],
				// отключить на проде
        synchronize: true, 
      }),
      inject: [ConfigService],
    }),

    VocabularyModule,
    GptModule,
    TranslationModule,
    LexiconModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

