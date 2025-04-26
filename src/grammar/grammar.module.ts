import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GrammarService } from './grammar.service';
import { GrammarController } from './grammar.controller';
import { Grammar } from './grammar.entity';
import { Lexicon } from '../vocabulary/lexicon/lexicon.entity';
import { LexiconModule } from '../vocabulary/lexicon/lexicon.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Grammar, Lexicon]),
		LexiconModule
  ],
  controllers: [GrammarController],
  providers: [GrammarService],
  exports: [GrammarService], // 👈 если нужно использовать в других модулях
})
export class GrammarModule {}
