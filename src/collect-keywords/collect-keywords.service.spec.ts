import { Test, TestingModule } from '@nestjs/testing';
import { CollectKeywordsService } from './collect-keywords.service';

describe('CollectKeywordsService', () => {
  let service: CollectKeywordsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CollectKeywordsService],
    }).compile();

    service = module.get<CollectKeywordsService>(CollectKeywordsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
