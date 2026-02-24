import { Test, TestingModule } from '@nestjs/testing';
import { DeliveriesController } from './deliveries.controller';
import { DeliveriesService } from './deliveries.service';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';

describe('DeliveriesController', () => {
  let controller: DeliveriesController;
  let service: DeliveriesService;

  // Mock del servicio para no tocar la base de datos
  const mockDeliveriesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateHeader: jest.fn(),
    remove: jest.fn(),
    addDetail: jest.fn(),
    updateDetail: jest.fn(),
    removeDetail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveriesController],
      providers: [
        {
          provide: DeliveriesService,
          useValue: mockDeliveriesService,
        },
      ],
    })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<DeliveriesController>(DeliveriesController);
    service = module.get<DeliveriesService>(DeliveriesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with dto and userId', async () => {
      const dto: CreateDeliveryDto = {
        clientId: 1,
        products: [],
      } as unknown as CreateDeliveryDto;
      const userId = 10;

      await controller.create(dto, userId);

      const createSpy = jest.spyOn(service, 'create');
      await controller.create(dto, userId);
      expect(createSpy).toHaveBeenCalledWith(dto, userId);
    });
  });

  describe('updateHeader', () => {
    it('should call service.updateHeader with correct params', async () => {
      const dto: UpdateDeliveryDto = { clientId: 2 };
      const id = 1;
      const userId = 10;

      await controller.updateHeader(id, dto, userId);

      const updateHeaderSpy = jest.spyOn(service, 'updateHeader');
      await controller.updateHeader(id, dto, userId);
      expect(updateHeaderSpy).toHaveBeenCalledWith(id, dto, userId);
    });
  });

  describe('Details Management (Atomic)', () => {
    it('addDetail should call service.addDetail', async () => {
      const DeliveryId = 1;
      const productId = 5;
      const quantity = 20;

      await controller.addDetail(DeliveryId, productId, quantity);

      const addDetailSpy = jest.spyOn(service, 'addDetail');
      await controller.addDetail(DeliveryId, productId, quantity);
      expect(addDetailSpy).toHaveBeenCalledWith(DeliveryId, productId, quantity);
    });

    it('updateDetail should call service.updateDetail', async () => {
      const detailId = 100;
      const quantity = 50;

      await controller.updateDetail(detailId, quantity);

      const updateDetailSpy = jest.spyOn(service, 'updateDetail');
      await controller.updateDetail(detailId, quantity);
      expect(updateDetailSpy).toHaveBeenCalledWith(detailId, quantity);
    });

    it('removeDetail should call service.removeDetail', async () => {
      const detailId = 100;

      await controller.removeDetail(detailId);

      const removeDetailSpy = jest.spyOn(service, 'removeDetail');
      await controller.removeDetail(detailId);
      expect(removeDetailSpy).toHaveBeenCalledWith(detailId);
    });
  });

  describe('remove', () => {
    it('should call service.remove with Delivery id', async () => {
      const id = 1;
      await controller.remove(id);

      const removeSpy = jest.spyOn(service, 'remove');
      await controller.remove(id);
      expect(removeSpy).toHaveBeenCalledWith(id);
    });
  });
});
