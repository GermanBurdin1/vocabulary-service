import { Controller, Patch, Param, Body, ParseIntPipe, Post } from '@nestjs/common';
import { GrammarService } from './grammar.service';
import { GrammarData } from './dto/grammar-data.dto'; 
import { LexiconService } from 'src/vocabulary/lexicon/lexicon.service';
import { Lexicon } from 'src/vocabulary/lexicon/lexicon.entity';

@Controller('grammar')
export class GrammarController {
  constructor(private readonly grammarService: GrammarService,private readonly lexiconService: LexiconService, ) {}

	@Patch(':id')
updateWord(@Param('id') id: number, @Body() grammarData: GrammarData) {
  return this.grammarService.updateGrammar(id, grammarData); // ← ✅ ПРАВИЛЬНО
}



	@Post()
async addWord(@Body() data: Partial<Lexicon>) {
  const word = await this.lexiconService.addOne(data);
  return { id: word.id, message: 'Слово создано' };
}

}
