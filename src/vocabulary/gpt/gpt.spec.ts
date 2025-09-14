import { Test, TestingModule } from '@nestjs/testing';
import { GptService } from './gpt.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

jest.mock('axios');
jest.mock('fs');

describe('GptService', () => {
  let service: GptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GptService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-api-key'),
          },
        },
      ],
    }).compile();

    service = module.get<GptService>(GptService);
    // configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return stats', () => {
    // Мокаем readLogs
    jest.spyOn<any, any>(service, 'readLogs').mockReturnValue([
      { userId: 'user1', timestamp: '2025-07', totalTokens: 100, promptTokens: 50, completionTokens: 50 },
      { userId: 'user1', timestamp: '2025-07', totalTokens: 50, promptTokens: 20, completionTokens: 30 },
    ]);

    const stats = service.getMonthlyStats('2025-07');
    expect(stats.user1.totalTokens).toBe(150);
    expect(stats.user1.requests).toBe(2);
  });

  it('should throw error when limit exceeded', async () => {
    jest.spyOn<any, any>(service, 'checkUserLimit').mockReturnValue(false);

    await expect(service.classifyWord('user1', 'тест')).rejects.toThrow(
      'Лимит запросов GPT для пользователя "user1" исчерпан.'
    );
  });

  it('should classify word successfully', async () => {
    jest.spyOn<any, any>(service, 'checkUserLimit').mockReturnValue(true);
    jest.spyOn<any, any>(service, 'saveLog').mockImplementation(() => {});
    jest.spyOn<any, any>(service, 'readLogs').mockReturnValue([]);

    (axios.post as jest.Mock).mockResolvedValue({
      data: {
        choices: [{ message: { content: '{"theme": "еда", "subtheme": "фрукты"}' } }],
        usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
      },
    });

    const result = await service.classifyWord('user1', 'яблоко');
    expect(result).toContain('"theme"');
  });

});
