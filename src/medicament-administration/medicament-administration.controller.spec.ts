import { Test, TestingModule } from '@nestjs/testing';
import { MedicamentAdministrationController } from './medicament-administration.controller';
import { MedicamentAdministrationService } from './medicament-administration.service';

describe('MedicamentAdministrationController', () => {
  let controller: MedicamentAdministrationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicamentAdministrationController],
      providers: [MedicamentAdministrationService],
    }).compile();

    controller = module.get<MedicamentAdministrationController>(MedicamentAdministrationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
