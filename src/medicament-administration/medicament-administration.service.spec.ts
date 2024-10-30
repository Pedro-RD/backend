import { Test, TestingModule } from '@nestjs/testing';
import { MedicamentAdministrationService } from './medicament-administration.service';

describe('MedicamentAdministrationService', () => {
  let service: MedicamentAdministrationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MedicamentAdministrationService],
    }).compile();

    service = module.get<MedicamentAdministrationService>(MedicamentAdministrationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
