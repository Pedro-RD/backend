import { Test, TestingModule } from '@nestjs/testing';
import { HealthReportController } from './health-report.controller';
import { HealthReportService } from './health-report.service';

describe('HealthReportController', () => {
  let controller: HealthReportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthReportController],
      providers: [HealthReportService],
    }).compile();

    controller = module.get<HealthReportController>(HealthReportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
