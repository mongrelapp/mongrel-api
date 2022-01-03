import { Test, TestingModule } from '@nestjs/testing';
import { CollectEmailController } from './collect-email.controller';

describe('CollectEmailController', () => {
  let controller: CollectEmailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollectEmailController],
    }).compile();

    controller = module.get<CollectEmailController>(CollectEmailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
