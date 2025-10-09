import { Test, TestingModule } from '@nestjs/testing';
import { LexiconService } from './lexicon.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Lexicon } from './lexicon.entity';
import { Grammar } from '../../grammar/grammar.entity';
import { Translation } from '../../translation/translation.entity';

const mockLexiconRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

const mockGrammarRepo = {
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

const mockTranslationRepo = {
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  find: jest.fn(),
};

describe('LexiconService', () => {
  let service: LexiconService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LexiconService,
        { provide: getRepositoryToken(Lexicon), useValue: mockLexiconRepo },
        { provide: getRepositoryToken(Grammar), useValue: mockGrammarRepo },
        { provide: getRepositoryToken(Translation), useValue: mockTranslationRepo },
      ],
    }).compile();

    service = module.get<LexiconService>(LexiconService);

    // Clear mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addOne', () => {
    it('should create and save a word without grammar and translations', async () => {
      const wordData = { word: 'test', translations: [] };
      mockLexiconRepo.create.mockReturnValue(wordData);
      mockLexiconRepo.save.mockResolvedValue({ id: 1, ...wordData });
      mockLexiconRepo.findOne.mockResolvedValue({ id: 1, ...wordData });

      const result = await service.addOne(wordData, 'user1');
      expect(mockLexiconRepo.create).toHaveBeenCalled();
      expect(mockLexiconRepo.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
    });
  });

  describe('updateOne', () => {
    it('should update and return the word', async () => {
      const id = 1;
      const data = { word: 'updated' };
      mockLexiconRepo.update.mockResolvedValue({});
      mockLexiconRepo.findOne.mockResolvedValue({ id, ...data });

      const result = await service.updateOne(id, data);
      expect(mockLexiconRepo.update).toHaveBeenCalledWith({ id }, data);
      expect(result.word).toBe('updated');
    });
  });

  describe('addMany', () => {
    it('should create and save multiple words', async () => {
      const words = [{ word: 'one' }, { word: 'two' }];
      mockLexiconRepo.create.mockImplementation((data) => data);
      mockLexiconRepo.save.mockImplementation(async (data) => ({ id: Math.random(), ...data }));

      const result = await service.addMany(words, 'user1');
      expect(result.length).toBe(2);
      expect(mockLexiconRepo.save).toHaveBeenCalledTimes(2);
    });
  });

  describe('markAsTranslated', () => {
    it('should update translated field', async () => {
      const id = 1;
      mockLexiconRepo.update.mockResolvedValue({});

      await service.markAsTranslated(id);
      expect(mockLexiconRepo.update).toHaveBeenCalledWith(id, { translated: true });
    });
  });

  describe('getAllByGalaxyAndSubtopic', () => {
    it('should return words filtered by galaxy and subtopic', async () => {
      mockLexiconRepo.find.mockResolvedValue([{ id: 1, word: 'word' }]);

      const result = await service.getAllByGalaxyAndSubtopic('galaxy1', 'subtopic1');
      expect(result.length).toBe(1);
      expect(mockLexiconRepo.find).toHaveBeenCalled();
    });
  });

  describe('findByWord', () => {
    it('should find a word by text', async () => {
      mockLexiconRepo.findOne.mockResolvedValue({ id: 1, word: 'test' });

      const result = await service.findByWord('test');
      expect(result.word).toBe('test');
      expect(mockLexiconRepo.findOne).toHaveBeenCalledWith({ where: { word: 'test' } });
    });
  });

  describe('updateStatus', () => {
    it('should update word status', async () => {
      const id = 1;
      const word = { id, status: null };
      mockLexiconRepo.findOneBy.mockResolvedValue(word);
      mockLexiconRepo.save.mockResolvedValue({ id, status: 'learned' });

      const result = await service.updateStatus(id, 'learned');
      expect(result.status).toBe('learned');
    });
  });

  describe('findById', () => {
    it('should find word by id', async () => {
      mockLexiconRepo.findOne.mockResolvedValue({ id: 1 });

      const result = await service.findById(1);
      expect(result.id).toBe(1);
    });
  });

  describe('updateRevealed', () => {
    it('should update revealed field', async () => {
      const id = 1;
      mockLexiconRepo.update.mockResolvedValue({});
      mockLexiconRepo.findOne.mockResolvedValue({ id, revealed: true });

      const result = await service.updateRevealed(id, true);
      expect(result.revealed).toBe(true);
    });
  });

  describe('deleteWord', () => {
    it('should delete word with grammar and translations', async () => {
      const id = 1;
      const word = {
        id,
        grammar: { id: 2 },
        translations: [{ id: 3 }],
      };
      mockLexiconRepo.findOne.mockResolvedValue(word);
      mockTranslationRepo.delete.mockResolvedValue({});
      mockGrammarRepo.delete.mockResolvedValue({});
      mockLexiconRepo.delete.mockResolvedValue({ affected: 1 });

      const result = await service.deleteWord(id);
      expect(result.affected).toBe(1);
    });
  });

  describe('getLearnedWordsCount', () => {
    it('should count learned words', async () => {
      mockLexiconRepo.count.mockResolvedValue(5);

      const result = await service.getLearnedWordsCount('user123');
      expect(result).toBe(5);
    });

    it('should return 0 if userId is invalid', async () => {
      const result = await service.getLearnedWordsCount('');
      expect(result).toBe(0);
    });
  });
});
