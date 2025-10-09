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
        const mockReq = { user: { sub: 'user1' } };
        const result = await controller.getByGalaxyAndSubtopic('galaxy1', 'subtopic1', mockReq);
        expect(service.getAllByGalaxyAndSubtopic).toHaveBeenCalledWith('galaxy1', 'subtopic1', 'user1');
        expect(result).toEqual([]);
    });

    it('should add one lexicon', async () => {
        const lexicon = { word: 'test' } as any;
        service.addOne.mockResolvedValue(lexicon);
        const mockReq = { user: { sub: 'user1' } };
        const result = await controller.addOne(lexicon, mockReq);
        expect(service.addOne).toHaveBeenCalledWith(lexicon, 'user1');
        expect(result).toEqual(lexicon);
    });

    it('should add many lexicons', async () => {
        const lexicons = [{ word: 'test1' }, { word: 'test2' }] as any[];
        service.addMany.mockResolvedValue(lexicons);
        const mockReq = { user: { sub: 'user1' } };
        const result = await controller.addMany(lexicons, mockReq);
        expect(service.addMany).toHaveBeenCalledWith(lexicons, 'user1');
        expect(result).toEqual(lexicons);
    });

    it('should mark as translated', async () => {
        service.markAsTranslated.mockResolvedValue({ success: true } as any);
        const mockReq = { user: { sub: 'user1' } };
        const result = await controller.markTranslated(1, mockReq);
        expect(service.markAsTranslated).toHaveBeenCalledWith(1, 'user1');
        expect(result).toEqual({ success: true });
    });

    it('should update status', async () => {
        service.updateStatus.mockResolvedValue({ success: true } as any);
        const dto: UpdateLexiconStatusDto = { status: 'learned' };
        const mockReq = { user: { sub: 'user1' } };
        const result = await controller.updateStatus(1, dto, mockReq);
        expect(service.updateStatus).toHaveBeenCalledWith(1, dto.status, 'user1');
        expect(result).toEqual({ success: true });
    });

    it('should update revealed', async () => {
        service.updateRevealed.mockResolvedValue({ success: true } as any);
        const mockReq = { user: { sub: 'user1' } };
        const result = await controller.updateRevealed(1, mockReq);
        expect(service.updateRevealed).toHaveBeenCalledWith(1, true, 'user1');
        expect(result).toEqual({ success: true });
    });

    it('should delete word', async () => {
        service.deleteWord.mockResolvedValue({ success: true } as any);
        const mockReq = { user: { sub: 'user1' } };
        const result = await controller.deleteWord(1, mockReq);
        expect(service.deleteWord).toHaveBeenCalledWith(1, 'user1');
        expect(result).toEqual({ success: true });
    });

    it('should get learned words count', async () => {
        service.getLearnedWordsCount.mockResolvedValue(5);
        const mockReq = { user: { sub: 'user1' } };
        const result = await controller.getLearnedWordsCount(mockReq);
        expect(service.getLearnedWordsCount).toHaveBeenCalledWith('user1');
        expect(result).toEqual({ count: 5 });
    });
});
