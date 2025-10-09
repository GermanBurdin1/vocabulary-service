import { Controller, Patch, Param, Body, Post, Req } from '@nestjs/common';
import { GrammarService } from './grammar.service';
import { GrammarData } from './dto/grammar-data.dto'; 
import { LexiconService } from 'src/vocabulary/lexicon/lexicon.service';
import { Lexicon } from 'src/vocabulary/lexicon/lexicon.entity';

@Controller('grammar')
export class GrammarController {
  constructor(private readonly grammarService: GrammarService,private readonly lexiconService: LexiconService, ) {}

	@Patch(':id')
updateWord(@Param('id') id: number, @Body() grammarData: GrammarData, @Req() req: any) {
  const userId = req.user?.sub;
  return this.grammarService.updateGrammar(id, grammarData, userId);
}



	@Post()
async addWord(@Body() data: Partial<Lexicon>, @Req() req: any) {
  const userId = req.user?.sub;
  const word = await this.lexiconService.addOne(data, userId);
  return { id: word.id, message: 'Слово создано' };
}

}
