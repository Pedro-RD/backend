import { Test, TestingModule } from '@nestjs/testing';
import { HealthReportService } from './health-report.service';

describe('HealthReportService', () => {
  let service: HealthReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthReportService],
    }).compile();

    service = module.get<HealthReportService>(HealthReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
