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
        const mockReq = { user: { sub: 'user1' } };
        const result = await controller.add(dto, mockReq);
        expect(service.addTranslation).toHaveBeenCalledWith(dto, 'user1');
        expect(result).toEqual(dto);
    });

    it('should add manual translation', async () => {
        const dto = { word: 'test', translation: 'тест' } as any;
        service.addManualTranslation.mockResolvedValue(dto);
        const mockReq = { user: { sub: 'user1' } };
        const result = await controller.addManual(dto, mockReq);
        expect(service.addManualTranslation).toHaveBeenCalledWith(dto, 'user1');
        expect(result).toEqual(dto);
    });

    it('should get by source', async () => {
        const translation = { word: 'cat', translation: 'chat' } as any;
        service.findBySource.mockResolvedValue(translation);
        const mockReq = { user: { sub: 'user1' } };
        const result = await controller.get('cat', 'en', 'fr', mockReq);
        expect(service.findBySource).toHaveBeenCalledWith('cat', 'en', 'fr', 'user1');
        expect(result).toEqual(translation);
    });

    it('should handle rate limit error', async () => {
        service.findBySource.mockRejectedValue(new Error('RATE_LIMIT_EXCEEDED'));
        const mockReq = { user: { sub: 'user1' } };
        await expect(controller.get('word', 'en', 'fr', mockReq)).rejects.toThrow('Превышен лимит переводов. Подождите минуту.');
    });

    it('should handle generic error', async () => {
        service.findBySource.mockRejectedValue(new Error('Other error'));
        const mockReq = { user: { sub: 'user1' } };
        await expect(controller.get('word', 'en', 'fr', mockReq)).rejects.toThrow('Ошибка при переводе');
    });

    it('should get stats', async () => {
        const stats = [{ source: 'cat', count: 100 }];
        service.getStats.mockResolvedValue(stats);
        const mockReq = { user: { sub: 'user1' } };
        const result = await controller.getStats(mockReq);
        expect(service.getStats).toHaveBeenCalled();
        expect(result).toEqual(stats);

    });

    it('should add extra translation', async () => {
        const dto = { word: 'dog', extra: 'woof' } as any;
        service.addExtraTranslation.mockResolvedValue(dto);
        const mockReq = { user: { sub: 'user1' } };
        const result = await controller.addExtraTranslation(dto, mockReq);
        expect(service.addExtraTranslation).toHaveBeenCalledWith(dto, 'user1');
        expect(result).toEqual(dto);
    });

    it('should update translation', async () => {
        const dto = { id: 1, word: 'cat', translation: 'chat' } as any;
        service.updateTranslation.mockResolvedValue(dto);
        const mockReq = { user: { sub: 'user1' } };
        const result = await controller.updateTranslation(dto, mockReq);
        expect(service.updateTranslation).toHaveBeenCalledWith(dto, 'user1');
        expect(result).toEqual(dto);
    });

    it('should update examples', async () => {
        const id = 1;
        const examples = ['example1', 'example2'];
        service.updateExamples.mockResolvedValue({ success: true } as any);
        const mockReq = { user: { sub: 'user1' } };
        const result = await controller.updateExamples(id, examples, mockReq);
        expect(service.updateExamples).toHaveBeenCalledWith(id, examples, 'user1');
        expect(result).toEqual({ success: true });
    });

    
});
