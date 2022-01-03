import { Test, TestingModule } from '@nestjs/testing';
import { CollectEmailService } from './collect-email.service';

describe('CollectEmailService', () => {
  let service: CollectEmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CollectEmailService],
    }).compile();

    service = module.get<CollectEmailService>(CollectEmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
