// translation.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Translation } from './translation.entity';
import { TranslationService } from './translation.service';
import { TranslationController } from './translation.controller';

describe('TranslationController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Translation],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Translation]),
      ],
      controllers: [TranslationController],
      providers: [TranslationService],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/translation (POST) should add translation', async () => {
    const res = await request(app.getHttpServer())
      .post('/translation')
      .send({
        source: 'chat',
        sourceLang: 'en',
        targetLang: 'fr',
        translated: 'discuter',
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.source).toBe('chat');
  });

  it('/translation/stats (GET) should return stats', async () => {
    const res = await request(app.getHttpServer()).get('/translation/stats').expect(200);
    expect(res.body).toBeDefined();
  });

  it('/translation (GET) should handle error gracefully', async () => {
    const res = await request(app.getHttpServer())
      .get('/translation')
      .query({ source: 'test', sourceLang: 'en', targetLang: 'fr' })
      .expect(200);
    expect(res.body).toBeDefined();
  });
});
