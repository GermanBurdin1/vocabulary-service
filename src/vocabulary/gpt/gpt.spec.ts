import { Test, TestingModule } from '@nestjs/testing';
import { GptService } from './gpt.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as fs from 'fs';

jest.mock('axios');
jest.mock('fs');

describe('GptService', () => {
  let service: GptService;
  let configService: ConfigService;

  beforeEach(async () => {
    // mock pour le config service avec API key
    const mockConfigService = {
      get: jest.fn().mockReturnValue('fake-api-key'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GptService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<GptService>(GptService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    // TODO : tester la classification avec vrais mots
  });

  // test basique pour la limite des utilisateur
  describe('checkUserLimit', () => {
    it('should return true pour utilisateurs with no requests', () => {
      // Ce test vérifie que les nouveaux utilisateurs peuvent faire des requetes
      const result = service['checkUserLimit']('new-user-id');
      expect(result).toBe(true);
    });
    // TODO : tester le cas où l'utilisateur dépasse sa limite
  });

  // test pour la méthode classify
  describe('classifyWord', () => {
    it('should throw error when user limit exceeded', async () => {
      // on teste que l'erreur est bien lancée
      jest.spyOn(service, 'checkUserLimit' as any).mockReturnValue(false);
      
      await expect(service.classifyWord('user1', 'test')).rejects.toThrow(
        'Limite requêtes GPT épuisée pour utilisateur "user1"'
      );
      // TODO : mocquer l'API OpenAI pour des tests plus complete
    });
  });
});
