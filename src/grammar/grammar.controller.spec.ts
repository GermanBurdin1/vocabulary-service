import { Test, TestingModule } from '@nestjs/testing';
import { GrammarController } from './grammar.controller';
import { GrammarService } from './grammar.service';
import { LexiconService } from 'src/vocabulary/lexicon/lexicon.service';
import { GrammarData } from './dto/grammar-data.dto';
import { Lexicon } from 'src/vocabulary/lexicon/lexicon.entity';
import { Grammar } from './grammar.entity';

describe('GrammarController', () => {
  let controller: GrammarController;
  let grammarService: jest.Mocked<GrammarService>;
  let lexiconService: jest.Mocked<LexiconService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GrammarController],
      providers: [
        {
          provide: GrammarService,
          useValue: {
            updateGrammar: jest.fn(),
          },
        },
        {
          provide: LexiconService,
          useValue: {
            addOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GrammarController>(GrammarController);
    grammarService = module.get(GrammarService);
    lexiconService = module.get(LexiconService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateWord', () => {
    it('should update grammar data', async () => {
      const grammarData: GrammarData = {
        partOfSpeech: 'verb',
        transitivity: 'transitive',
        isIrregular: false,
        isPronominal: false,
      };

      const grammarMock: Grammar = {
        id: 1,
        partOfSpeech: 'verb',
        transitivity: 'transitive',
        isIrregular: false,
        isPronominal: false,
        lexicon: {
          id: 42,
          translations: [],
          word: 'chat',
          translated: false,
          type: 'word',
          galaxy: 'default',
          subtopic: 'default',
          createdAt: Date.now(),
          userId: 'user1',
          status: null,
          revealed: false,
          postponed: false,
          grammar: undefined,
        },
      };
      

      grammarService.updateGrammar.mockResolvedValue({
        message: 'Grammar updated successfully',
        grammar: grammarMock,
      });

      const result = await controller.updateWord(1, grammarData);
      expect(grammarService.updateGrammar).toHaveBeenCalledWith(1, grammarData);
      expect(result).toEqual({
        message: 'Grammar updated successfully',
        grammar: grammarMock,
      });
    });
  });

  describe('addWord', () => {
    it('should add word and return id with message', async () => {
      const wordData = { word: 'chat', translation: 'cat' };

      const lexiconMock: Lexicon = {
        id: 42,
        translations: [],
        word: 'chat',
        translated: false,
        type: 'word', // ✅ исправлено
        galaxy: 'default', // ✅ исправлено
        subtopic: 'default', // ✅ исправлено
        createdAt: Date.now(),
        userId: 'user1',
        status: null,
        revealed: false,
        postponed: false,
        grammar: undefined,
      };

      lexiconService.addOne.mockResolvedValue(lexiconMock);

      const result = await controller.addWord(wordData);
      expect(lexiconService.addOne).toHaveBeenCalledWith(wordData);
      expect(result).toEqual({ id: 42, message: 'Слово создано' });
    });
  });
});
