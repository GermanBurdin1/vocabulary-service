import { Test, TestingModule } from '@nestjs/testing';
import { GrammarService } from './grammar.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Grammar } from './grammar.entity';
import { Lexicon } from '../vocabulary/lexicon/lexicon.entity';
import { Repository } from 'typeorm';
import { GrammarData } from './dto/grammar-data.dto';

const mockGrammarRepo = {
  findOne: jest.fn(),
  update: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockLexiconRepo = {
  findOne: jest.fn(),
};

describe('GrammarService', () => {
  let service: GrammarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GrammarService,
        { provide: getRepositoryToken(Grammar), useValue: mockGrammarRepo },
        { provide: getRepositoryToken(Lexicon), useValue: mockLexiconRepo },
      ],
    }).compile();

    service = module.get<GrammarService>(GrammarService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateGrammar', () => {
    const wordId = 1;
    const grammarData: GrammarData = {
      partOfSpeech: 'noun',
      gender: 'feminine',
    };

    it('should throw error if word not found', async () => {
      mockLexiconRepo.findOne.mockResolvedValue(null);

      await expect(service.updateGrammar(wordId, grammarData)).rejects.toThrow('Слово не найдено');
      expect(mockLexiconRepo.findOne).toHaveBeenCalledWith({ where: { id: wordId } });
    });

    it('should update existing grammar', async () => {
      const word = { id: wordId };
      const existingGrammar = { id: 2 };
      mockLexiconRepo.findOne.mockResolvedValue(word);
      mockGrammarRepo.findOne.mockResolvedValue(existingGrammar);
      mockGrammarRepo.update.mockResolvedValue({});
      mockGrammarRepo.findOne.mockResolvedValue({ id: 2, ...grammarData });

      const result = await service.updateGrammar(wordId, grammarData);

      expect(mockGrammarRepo.update).toHaveBeenCalledWith(2, { ...grammarData, lexicon: word });
      expect(result.grammar).toEqual({ id: 2, ...grammarData });
    });

    it('should create new grammar if not exists', async () => {
      const word = { id: wordId };
      mockLexiconRepo.findOne.mockResolvedValue(word);
      mockGrammarRepo.findOne.mockResolvedValue(null);
      const savedGrammar = {
        id: 3,
        ...grammarData,
        lexicon: { id: wordId },
      };
      mockGrammarRepo.create.mockReturnValue(savedGrammar);
      mockGrammarRepo.save.mockResolvedValue(savedGrammar);

      const result = await service.updateGrammar(wordId, grammarData);

      expect(mockGrammarRepo.create).toHaveBeenCalledWith({ ...grammarData, lexicon: word });
      expect(mockGrammarRepo.save).toHaveBeenCalled();
      // ✅ Используем toMatchObject, чтобы игнорировать lexicon
      expect(result.grammar).toMatchObject({ id: 3, ...grammarData });
    });
  });
});


