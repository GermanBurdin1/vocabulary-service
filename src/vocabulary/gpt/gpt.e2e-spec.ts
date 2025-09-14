import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { GptController } from './gpt.controller';
import { GptService } from './gpt.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GptController (e2e)', () => {
  let app: INestApplication;

  const logsFile = path.join(__dirname, './gpt-usage-log.json');

  beforeAll(async () => {
    // Удаляем лог, если есть
    if (fs.existsSync(logsFile)) {
      fs.unlinkSync(logsFile);
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [GptController],
      providers: [
        GptService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('fake-api-key'),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false }));
    await app.init();

    // service = moduleFixture.get<GptService>(GptService);
  });

  afterAll(async () => {
    await app.close();
    if (fs.existsSync(logsFile)) {
      fs.unlinkSync(logsFile);
    }
  });

  it('/gpt/classify (POST) — успешный запрос', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        choices: [
          {
            message: {
              content: JSON.stringify({ theme: 'Nature', subtheme: 'Animals' }),
            },
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 15,
          total_tokens: 25,
        },
      },
    });

    const payload = { text: 'кошка', userId: 'user1' };

    const res = await request(app.getHttpServer())
      .post('/gpt/classify')
      .send(payload)
      .expect(201);

    expect(res.body).toEqual({ theme: 'Nature', subtheme: 'Animals' });

    const logs = JSON.parse(fs.readFileSync(logsFile, 'utf-8'));
    expect(logs[0]).toMatchObject({
      userId: 'user1',
      totalTokens: 25,
    });
  });

  it('/gpt/monthly-stats/:month (GET) — получить статистику', async () => {
    const month = new Date().toISOString().slice(0, 7);
    const res = await request(app.getHttpServer())
      .get(`/gpt/monthly-stats/${month}`)
      .expect(200);

    expect(res.body).toHaveProperty('user1');
    expect(res.body.user1.totalTokens).toBeGreaterThan(0);
  });

  it('/gpt/classify (POST) — превышение лимита', async () => {
    // Создаем фейковые логи с превышением лимита
    const fakeLogs = [];
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);
    for (let i = 0; i < 50; i++) {
      fakeLogs.push({
        userId: 'user-limit',
        timestamp: `${currentMonth}-01T00:00:00Z`,
        promptTokens: 5,
        completionTokens: 5,
        totalTokens: 10,
      });
    }
    fs.writeFileSync(logsFile, JSON.stringify(fakeLogs, null, 2));

    const payload = { text: 'яблоко', userId: 'user-limit' };

    const res = await request(app.getHttpServer())
      .post('/gpt/classify')
      .send(payload)
      .expect(500);

    expect(res.body.message).toContain('Лимит запросов GPT для пользователя "user-limit" исчерпан.');
  });
});
