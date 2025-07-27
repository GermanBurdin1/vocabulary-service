import { Test, TestingModule } from '@nestjs/testing';
import { GrammarService } from './grammar.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Grammar } from './grammar.entity';
import { Lexicon } from '../vocabulary/lexicon/lexicon.entity';
import { Repository } from 'typeorm';
import { GrammarData } from './dto/grammar-data.dto';

describe('GrammarService', () => {
  let service: GrammarService;
  let grammarRepo: Repository<Grammar>;
  let lexiconRepo: Repository<Lexicon>;

  // mocks pour les deux repositorys
  const mockGrammarRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockLexiconRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GrammarService,
        { provide: getRepositoryToken(Grammar), useValue: mockGrammarRepo },
        { provide: getRepositoryToken(Lexicon), useValue: mockLexiconRepo },
      ],
    }).compile();

    service = module.get<GrammarService>(GrammarService);
    grammarRepo = module.get<Repository<Grammar>>(getRepositoryToken(Grammar));
    lexiconRepo = module.get<Repository<Lexicon>>(getRepositoryToken(Lexicon));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    // TODO : tester avec différent types de grammaire (noun, verb, etc.)
  });

  describe('updateGrammar', () => {
    it('should throw error when word not found', async () => {
      // on teste le cas où le mot existe pas
      mockLexiconRepo.findOne.mockResolvedValue(null);

      await expect(service.updateGrammar(999, { partOfSpeech: 'noun' }))
        .rejects.toThrow('Mot introuvable');
      
      expect(mockLexiconRepo.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
      // TODO : tester aussi la création de nouvell grammaire
    });
  });
});


