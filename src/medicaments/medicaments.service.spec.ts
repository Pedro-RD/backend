import { Test, TestingModule } from '@nestjs/testing';
import { MedicamentsService } from './medicaments.service';

describe('MedicamentsService', () => {
  let service: MedicamentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MedicamentsService],
    }).compile();

    service = module.get<MedicamentsService>(MedicamentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
