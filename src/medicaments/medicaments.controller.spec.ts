import { Test, TestingModule } from '@nestjs/testing';
import { MedicamentsController } from './medicaments.controller';
import { MedicamentsService } from './medicaments.service';

describe('MedicamentsController', () => {
  let controller: MedicamentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicamentsController],
      providers: [MedicamentsService],
    }).compile();

    controller = module.get<MedicamentsController>(MedicamentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
