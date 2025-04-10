import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lexicon } from './lexicon.entity';
import { LexiconService } from './lexicon.service';
import { LexiconController } from './lexicon.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Lexicon])],
  providers: [LexiconService],
	exports: [LexiconService],
  controllers: [LexiconController],
})
export class LexiconModule {}
