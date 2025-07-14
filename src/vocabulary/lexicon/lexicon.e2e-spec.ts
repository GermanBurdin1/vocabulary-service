// lexicon.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lexicon } from './lexicon.entity';
import { LexiconService } from './lexicon.service';
import { LexiconController } from './lexicon.controller';

describe('LexiconController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Lexicon],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Lexicon]),
      ],
      controllers: [LexiconController],
      providers: [LexiconService],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/lexicon (POST) should add one lexicon', async () => {
    const res = await request(app.getHttpServer())
      .post('/lexicon')
      .send({
        word: 'bonjour',
        translation: 'hello',
        galaxy: 'basic',
        subtopic: 'greetings',
        userId: 'user1',
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.word).toBe('bonjour');
  });

  it('/lexicon (GET) should get by galaxy and subtopic', async () => {
    const res = await request(app.getHttpServer())
      .get('/lexicon')
      .query({ galaxy: 'basic', subtopic: 'greetings', userId: 'user1' })
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });
});
