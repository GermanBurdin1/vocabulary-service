import { Test, TestingModule } from '@nestjs/testing';
import { LexiconService } from './lexicon.service';

describe('LexiconService', () => {
  let service: LexiconService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LexiconService],
    }).compile();

    service = module.get<LexiconService>(LexiconService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
