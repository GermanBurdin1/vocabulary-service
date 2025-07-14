import { Test, TestingModule } from '@nestjs/testing';
import { TranslationController } from './translation.controller';
import { TranslationService } from './translation.service';

describe('TranslationController', () => {
    let controller: TranslationController;
    let service: jest.Mocked<TranslationService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TranslationController],
            providers: [
                {
                    provide: TranslationService,
                    useValue: {
                        addTranslation: jest.fn(),
                        addManualTranslation: jest.fn(),
                        findBySource: jest.fn(),
                        getStats: jest.fn(),
                        addExtraTranslation: jest.fn(),
                        updateTranslation: jest.fn(),
                        updateExamples: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<TranslationController>(TranslationController);
        service = module.get(TranslationService);
    });

    it('should add translation', async () => {
        const dto = { word: 'test', sourceLang: 'en', targetLang: 'fr' } as any;
        service.addTranslation.mockResolvedValue(dto);
        const result = await controller.add(dto);
        expect(service.addTranslation).toHaveBeenCalledWith(dto);
        expect(result).toEqual(dto);
    });

    it('should add manual translation', async () => {
        const dto = { word: 'test', translation: 'тест' } as any;
        service.addManualTranslation.mockResolvedValue(dto);
        const result = await controller.addManual(dto);
        expect(service.addManualTranslation).toHaveBeenCalledWith(dto);
        expect(result).toEqual(dto);
    });

    it('should get by source', async () => {
        const translation = { word: 'cat', translation: 'chat' } as any;
        service.findBySource.mockResolvedValue(translation);
        const result = await controller.get('cat', 'en', 'fr');
        expect(service.findBySource).toHaveBeenCalledWith('cat', 'en', 'fr');
        expect(result).toEqual(translation);
    });

    it('should handle rate limit error', async () => {
        service.findBySource.mockRejectedValue(new Error('RATE_LIMIT_EXCEEDED'));
        await expect(controller.get('word', 'en', 'fr')).rejects.toThrow('Превышен лимит переводов. Подождите минуту.');
    });

    it('should handle generic error', async () => {
        service.findBySource.mockRejectedValue(new Error('Other error'));
        await expect(controller.get('word', 'en', 'fr')).rejects.toThrow('Ошибка при переводе');
    });

    it('should get stats', async () => {
        const stats = [{ source: 'cat', count: 100 }];
        service.getStats.mockResolvedValue(stats);
        const result = await controller.getStats();
        expect(service.getStats).toHaveBeenCalled();
        expect(result).toEqual(stats);

    });

    it('should add extra translation', async () => {
        const dto = { word: 'dog', extra: 'woof' } as any;
        service.addExtraTranslation.mockResolvedValue(dto);
        const result = await controller.addExtraTranslation(dto);
        expect(service.addExtraTranslation).toHaveBeenCalledWith(dto);
        expect(result).toEqual(dto);
    });

    it('should update translation', async () => {
        const dto = { id: 1, word: 'cat', translation: 'chat' } as any;
        service.updateTranslation.mockResolvedValue(dto);
        const result = await controller.updateTranslation(dto);
        expect(service.updateTranslation).toHaveBeenCalledWith(dto);
        expect(result).toEqual(dto);
    });

    it('should update examples', async () => {
        const id = 1;
        const examples = ['example1', 'example2'];
        service.updateExamples.mockResolvedValue({ success: true } as any);
        const result = await controller.updateExamples(id, examples);
        expect(service.updateExamples).toHaveBeenCalledWith(id, examples);
        expect(result).toEqual({ success: true });
    });

    
});
