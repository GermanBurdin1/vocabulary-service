import { Test, TestingModule } from '@nestjs/testing';
import { TranslationController } from './translation.controller';
import { TranslationService } from './translation.service';

describe('TranslationController', () => {
  let controller: TranslationController;
  let service: TranslationService;

  // mock complet du service de traduction
  const mockTranslationService = {
    addTranslation: jest.fn(),
    addManualTranslation: jest.fn(),
    findBySource: jest.fn(),
    getStats: jest.fn(),
    addExtraTranslation: jest.fn(),
    updateTranslation: jest.fn(),
    updateExamples: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TranslationController],
      providers: [
        { provide: TranslationService, useValue: mockTranslationService },
      ],
    }).compile();

    controller = module.get<TranslationController>(TranslationController);
    service = module.get<TranslationService>(TranslationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    // TODO : tester tous les endpoints avec données réel
  });

  describe('GET /translation', () => {
    it('should return translation when found', async () => {
      // test basic pour récupérer une traduction
      const mockResult = { word: 'bonjour', translations: ['hello'] };
      mockTranslationService.findBySource.mockResolvedValue(mockResult);

      const result = await controller.get('bonjour', 'fr', 'en');
      
      expect(result).toEqual(mockResult);
      expect(service.findBySource).toHaveBeenCalledWith('bonjour', 'fr', 'en');
    });

    it('should handle rate limit error', async () => {
      // on teste la gestion d'erreur pour limite de taux
      mockTranslationService.findBySource.mockRejectedValue(
        new Error('RATE_LIMIT_EXCEEDED')
      );

      await expect(controller.get('test', 'fr', 'en'))
        .rejects.toThrow('Limite de traduction dépassée. Veuillez patienter une minute.');
      // TODO : tester aussi les autres cas d'erreur
    });
  });
});
