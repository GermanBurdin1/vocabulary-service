import { Body, Controller, Post } from '@nestjs/common';
import { LexiconService } from './lexicon.service';
import { Lexicon } from './lexicon.entity';

@Controller('lexicon')
export class LexiconController {
  constructor(private readonly lexiconService: LexiconService) {}

  @Post()
  async addOne(@Body() body: Partial<Lexicon>) {
    return this.lexiconService.addOne(body);
  }

  @Post('bulk')
  async addMany(@Body() body: Partial<Lexicon>[]) {
    return this.lexiconService.addMany(body);
  }
}
