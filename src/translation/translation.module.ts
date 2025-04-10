import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TranslationController } from './translation.controller';
import { TranslationService } from './translation.service';
import { Translation } from './translation.entity';
import { TranslationStats } from './translation-stats.entity';
import { LexiconModule } from 'src/vocabulary/lexicon/lexicon.module';

@Module({
	imports: [TypeOrmModule.forFeature([Translation, TranslationStats]), LexiconModule],
	controllers: [TranslationController],
	providers: [TranslationService],
})
export class TranslationModule { }
