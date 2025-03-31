import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VocabularyModule } from './vocabulary.module';
import { GptModule } from './vocabulary/gpt/gpt.module';
import { TranslationModule } from './translation/translation.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [VocabularyModule, GptModule, TranslationModule,ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
