import { Test, TestingModule } from '@nestjs/testing';
import { GptController } from './gpt.controller';
import { GptService } from './gpt.service';

describe('GptController', () => {
  let controller: GptController;
  let service: GptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GptController],
      providers: [
        {
          provide: GptService,
          useValue: {
            classifyWord: jest.fn().mockResolvedValue('{"theme":"еда","subtheme":"фрукты"}'),
            getMonthlyStats: jest.fn().mockReturnValue({ user1: { totalTokens: 100, requests: 2 } }),
          },
        },
      ],
    }).compile();

    controller = module.get<GptController>(GptController);
    service = module.get<GptService>(GptService);
  });

  it('should classify and parse result', async () => {
    const res = await controller.classify('яблоко', 'user1');
    expect(service.classifyWord).toHaveBeenCalledWith('user1', 'яблоко');
    expect(res).toEqual({ theme: 'еда', subtheme: 'фрукты' });
  });

  it('should get monthly stats', () => {
    const stats = controller.getStats('2025-07');
    expect(service.getMonthlyStats).toHaveBeenCalledWith('2025-07');
    expect(stats).toEqual({ user1: { totalTokens: 100, requests: 2 } });
  });
});
