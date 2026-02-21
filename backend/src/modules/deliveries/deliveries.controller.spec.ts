import { Test, TestingModule } from '@nestjs/testing';
import { DeliveriesController } from './deliveries.controller';
import { DeliveriesService } from './deliveries.service';

describe('DeliveriesController', () => {
  let controller: DeliveriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveriesController],
      providers: [DeliveriesService],
    }).compile();

    controller = module.get<DeliveriesController>(DeliveriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
