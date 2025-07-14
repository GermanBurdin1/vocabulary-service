import { Test, TestingModule } from '@nestjs/testing';
import { LexiconController } from './lexicon.controller';
import { LexiconService } from './lexicon.service';
import { UpdateLexiconStatusDto } from './dto/update-lexicon-status.dto';

describe('LexiconController', () => {
    let controller: LexiconController;
    let service: jest.Mocked<LexiconService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [LexiconController],
            providers: [
                {
                    provide: LexiconService,
                    useValue: {
                        getAllByGalaxyAndSubtopic: jest.fn(),
                        addOne: jest.fn(),
                        addMany: jest.fn(),
                        markAsTranslated: jest.fn(),
                        updateStatus: jest.fn(),
                        updateRevealed: jest.fn(),
                        deleteWord: jest.fn(),
                        getLearnedWordsCount: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<LexiconController>(LexiconController);
        service = module.get(LexiconService);
    });

    it('should get by galaxy and subtopic', async () => {
        service.getAllByGalaxyAndSubtopic.mockResolvedValue([]);
        const result = await controller.getByGalaxyAndSubtopic('galaxy1', 'subtopic1', 'user1');
        expect(service.getAllByGalaxyAndSubtopic).toHaveBeenCalledWith('galaxy1', 'subtopic1', 'user1');
        expect(result).toEqual([]);
    });

    it('should add one lexicon', async () => {
        const lexicon = { word: 'test' } as any;
        service.addOne.mockResolvedValue(lexicon);
        const result = await controller.addOne(lexicon);
        expect(service.addOne).toHaveBeenCalledWith(lexicon);
        expect(result).toEqual(lexicon);
    });

    it('should add many lexicons', async () => {
        const lexicons = [{ word: 'test1' }, { word: 'test2' }] as any[];
        service.addMany.mockResolvedValue(lexicons);
        const result = await controller.addMany(lexicons);
        expect(service.addMany).toHaveBeenCalledWith(lexicons);
        expect(result).toEqual(lexicons);
    });

    it('should mark as translated', async () => {
        service.markAsTranslated.mockResolvedValue({ success: true } as any);
        const result = await controller.markTranslated(1);
        expect(service.markAsTranslated).toHaveBeenCalledWith(1);
        expect(result).toEqual({ success: true });
    });

    it('should update status', async () => {
        service.updateStatus.mockResolvedValue({ success: true } as any);
        const dto: UpdateLexiconStatusDto = { status: 'learned' };
        const result = await controller.updateStatus(1, dto);
        expect(service.updateStatus).toHaveBeenCalledWith(1, dto.status);
        expect(result).toEqual({ success: true });
    });

    it('should update revealed', async () => {
        service.updateRevealed.mockResolvedValue({ success: true } as any);
        const result = await controller.updateRevealed(1);
        expect(service.updateRevealed).toHaveBeenCalledWith(1, true);
        expect(result).toEqual({ success: true });
    });

    it('should delete word', async () => {
        service.deleteWord.mockResolvedValue({ success: true } as any);
        const result = await controller.deleteWord(1);
        expect(service.deleteWord).toHaveBeenCalledWith(1);
        expect(result).toEqual({ success: true });
    });

    it('should get learned words count', async () => {
        service.getLearnedWordsCount.mockResolvedValue(5);
        const result = await controller.getLearnedWordsCount('user1');
        expect(service.getLearnedWordsCount).toHaveBeenCalledWith('user1');
        expect(result).toEqual({ count: 5 });
    });
});
