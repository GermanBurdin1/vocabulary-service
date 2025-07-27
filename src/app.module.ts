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
import { GrammarModule } from './grammar/grammar.module';
import { Grammar } from './grammar/grammar.entity';

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
        entities: [Lexicon, Translation, TranslationStats, Example, Grammar],
				// désactiver en production
        synchronize: true, 
      }),
      inject: [ConfigService],
    }),

    VocabularyModule,
    GptModule,
    TranslationModule,
    LexiconModule,
    GrammarModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  // TODO : ajouter des modules de cache et monitoring pour améliorer les performances
})
export class AppModule {}

