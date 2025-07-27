import { Test, TestingModule } from '@nestjs/testing';
import { TranslationService } from './translation.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Translation } from './translation.entity';
import { TranslationStats } from './translation-stats.entity';
import { LexiconService } from 'src/vocabulary/lexicon/lexicon.service';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';

// mocks pour les repositorys de traduction
const mockTranslationRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  findOneBy: jest.fn(),
  find: jest.fn(),
};

const mockStatsRepo = {
  find: jest.fn(),
};

const mockLexiconService = {
  findById: jest.fn(),
  findByWord: jest.fn(),
  markAsTranslated: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

describe('TranslationService', () => {
  let service: TranslationService;

  beforeEach(async () => {
    // setup du module avec tous les mocks
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TranslationService,
        { provide: getRepositoryToken(Translation), useValue: mockTranslationRepo },
        { provide: getRepositoryToken(TranslationStats), useValue: mockStatsRepo },
        { provide: LexiconService, useValue: mockLexiconService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<TranslationService>(TranslationService);

    jest.clearAllMocks();
    // TODO : ajouter des tests pour les cas d'erreur API
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStats', () => {
    it('should return formatted stats', async () => {
      mockStatsRepo.find.mockResolvedValue([
        { sourceLang: 'fr', targetLang: 'ru', from: 'cache', count: 10 },
      ]);
      const result = await service.getStats();
      expect(result[0]).toHaveProperty('source', 'fr → ru [cache]');
      expect(result[0]).toHaveProperty('count', 10);
    });
  });

  describe('addTranslation', () => {
    it('should return existing translation if found', async () => {
      const translation = { id: 1, source: 'chat', target: 'cat' };
      mockTranslationRepo.findOne.mockResolvedValue(translation);
      const result = await service.addTranslation({
        source: 'chat',
        target: 'cat',
        sourceLang: 'fr',
        targetLang: 'en',
        meaning: '',
        lexicon: {} as any,
        examples: [],
      });
      expect(result).toEqual(translation);
    });

    it('should create and save new translation', async () => {
      mockTranslationRepo.findOne.mockResolvedValue(undefined);
      mockTranslationRepo.create.mockImplementation((dto) => dto);
      mockTranslationRepo.save.mockResolvedValue({ id: 2, source: 'chien', target: 'dog' });

      const result = await service.addTranslation({
        source: 'chien',
        target: 'dog',
        sourceLang: 'fr',
        targetLang: 'en',
        meaning: '',
        lexicon: {} as any,
        examples: [],
      });
      expect(result.id).toBe(2);
      expect(mockTranslationRepo.save).toHaveBeenCalled();
    });
  });

  describe('addManualTranslation', () => {
    it('should throw if lexicon not found', async () => {
      mockLexiconService.findById.mockResolvedValue(null);
      await expect(
        service.addManualTranslation({
          wordId: 1,
          sourceText: 'chien',
          translation: 'dog',
          sourceLang: 'fr',
          targetLang: 'en',
        }),
      ).rejects.toThrow('❌ Lexicon not found');
    });

    it('should return existing translation if found', async () => {
      mockLexiconService.findById.mockResolvedValue({ id: 1 });
      mockTranslationRepo.findOne.mockResolvedValue({ id: 10 });

      const result = await service.addManualTranslation({
        wordId: 1,
        sourceText: 'chien',
        translation: 'dog',
        sourceLang: 'fr',
        targetLang: 'en',
      });

      expect(result).toEqual({ id: 10 });
    });

    it('should create and save new manual translation', async () => {
      mockLexiconService.findById.mockResolvedValue({ id: 1 });
      mockTranslationRepo.findOne.mockResolvedValue(undefined);
      mockTranslationRepo.create.mockImplementation((dto) => dto);
      mockTranslationRepo.save.mockResolvedValue({ id: 20 });

      const result = await service.addManualTranslation({
        wordId: 1,
        sourceText: 'chat',
        translation: 'cat',
        sourceLang: 'fr',
        targetLang: 'en',
      });

      expect(result.id).toBe(20);
    });
  });

  describe('updateTranslation', () => {
    it('should update translation target', async () => {
      const translation = { id: 1, target: 'dog' };
      mockTranslationRepo.findOneBy.mockResolvedValue(translation);
      mockTranslationRepo.save.mockResolvedValue({ id: 1, target: 'hound' });

      const result = await service.updateTranslation({
        translationId: 1,
        newTranslation: 'hound',
      });

      expect(result.target).toBe('hound');
    });

    it('should throw if translation not found', async () => {
      mockTranslationRepo.findOneBy.mockResolvedValue(null);
      await expect(
        service.updateTranslation({ translationId: 99, newTranslation: 'fox' }),
      ).rejects.toThrow('❌ Translation not found');
    });
  });

  describe('updateExamples', () => {
    it('should update examples', async () => {
      const translation = { id: 1, examples: [] };
      mockTranslationRepo.findOne.mockResolvedValue(translation);
      mockTranslationRepo.save.mockImplementation((data) => data);

      const result = await service.updateExamples(1, ['This is an example.']);
      expect(result.examples[0].sentence).toBe('This is an example.');
    });

    it('should throw if translation not found', async () => {
      mockTranslationRepo.findOne.mockResolvedValue(null);
      await expect(service.updateExamples(1, ['example'])).rejects.toThrow('Translation not found');
    });
  });

  describe('findBySource', () => {
    it('should return from cache if found', async () => {
      mockTranslationRepo.findOne.mockResolvedValue({
        target: 'cat',
        grammar: {
          partOfSpeech: 'noun',
          gender: 'masculine',
        },
      });
  
      const result = await service.findBySource('chat', 'fr', 'en');
  
      expect(result.from).toBe('cache');
      expect(result.translations[0]).toBe('cat');
    });
  
    it('should return from wiktionary if not found in cache', async () => {
      mockTranslationRepo.findOne.mockResolvedValue(undefined);
  
      jest.spyOn(service['wiktionary'], 'find').mockResolvedValue([
        {
          translations: [{ word: 'chat' }],
          grammar: { partOfSpeech: 'noun', gender: 'masculine' },
        },
      ]);
  
      mockLexiconService.findByWord.mockResolvedValue({ id: 1 });
  
      mockTranslationRepo.create.mockImplementation((dto) => dto);
      mockTranslationRepo.save.mockResolvedValue({ id: 10 });
  
      const result = await service.findBySource('chat', 'fr', 'en');
  
      expect(result.from).toBe('wiktionary');
      expect(result.translations[0]).toBe('chat');
      expect(mockLexiconService.markAsTranslated).toHaveBeenCalledWith(1);
    });
  
    it('should return from api if not found in cache or wiktionary', async () => {
      mockTranslationRepo.findOne.mockResolvedValue(undefined);
  
      jest.spyOn(service['wiktionary'], 'find').mockResolvedValue([]);
  
      service['translateViaApi'] = jest.fn().mockResolvedValue(['katze']);
      mockLexiconService.findByWord.mockResolvedValue({ id: 2 });
  
      mockTranslationRepo.create.mockImplementation((dto) => dto);
      mockTranslationRepo.save.mockResolvedValue({ id: 20 });
  
      const result = await service.findBySource('chat', 'fr', 'en');
  
      expect(result.from).toBe('api');
      expect(result.translations[0]).toBe('katze');
      expect(mockLexiconService.markAsTranslated).toHaveBeenCalledWith(2);
    });
  
    it('should throw error if api call fails', async () => {
      mockTranslationRepo.findOne.mockResolvedValue(undefined);
  
      jest.spyOn(service['wiktionary'], 'find').mockResolvedValue([]);
  
      service['translateViaApi'] = jest.fn().mockRejectedValue(new Error('DEEPL_FAILED'));
  
      await expect(service.findBySource('chien', 'fr', 'en')).rejects.toThrow('DEEPL_FAILED');
    });
  });
  

});
