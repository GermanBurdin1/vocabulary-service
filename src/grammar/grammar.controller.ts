import { Controller } from '@nestjs/common';
import { GrammarService } from './grammar.service';

@Controller('grammar')
export class GrammarController {
  constructor(private readonly grammarService: GrammarService) {}
}
