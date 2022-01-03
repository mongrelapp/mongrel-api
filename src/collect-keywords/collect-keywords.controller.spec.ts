import { Test, TestingModule } from '@nestjs/testing';
import { CollectKeywordsController } from './collect-keywords.controller';

describe('CollectKeywordsController', () => {
  let controller: CollectKeywordsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollectKeywordsController],
    }).compile();

    controller = module.get<CollectKeywordsController>(CollectKeywordsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
