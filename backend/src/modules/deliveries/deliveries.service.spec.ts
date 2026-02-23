import { Test, TestingModule } from '@nestjs/testing';
import { DeliveriesService } from './deliveries.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Delivery } from './entities/delivery.entity';
import { DeliveryProduct } from './entities/deliveryProduct.entity';
import { Product } from '../products/entities/product.entity';
import { DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';

describe('DeliveriesService', () => {
  let service: DeliveriesService;

  const mockDeliveryRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    preload: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    })),
  };

  const mockDeliveryProductRepository = {
    findOne: jest.fn(),
  };

  const queryRunnerMock = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      decrement: jest.fn(),
      increment: jest.fn(),
      remove: jest.fn(),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn(() => queryRunnerMock),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveriesService,
        { provide: getRepositoryToken(Delivery), useValue: mockDeliveryRepository },
        { provide: getRepositoryToken(DeliveryProduct), useValue: mockDeliveryProductRepository },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<DeliveriesService>(DeliveriesService);

    jest.clearAllMocks();
  });

  // --- DELIVERIES TEST ---

  describe('create', () => {
    it('should create a delivery and decrement stock', async () => {
      const dto = { products: [{ product_id: 1, quantity: 5 }] };
      const userId = 123;

      queryRunnerMock.manager.findOne.mockResolvedValue({ id: 1, quantity: 10 }); // Stock suficiente
      queryRunnerMock.manager.save.mockResolvedValue({ id: 100, ...dto });

      const result = await service.create(dto as CreateDeliveryDto, userId);

      expect(queryRunnerMock.startTransaction).toHaveBeenCalled();
      expect(queryRunnerMock.manager.decrement).toHaveBeenCalled();
      expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should rollback on failure', async () => {
      queryRunnerMock.manager.save.mockRejectedValue(new Error('DB Error'));
      await expect(
        service.create({ products: [] } as unknown as CreateDeliveryDto, 1),
      ).rejects.toThrow();
      expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all deliveries', async () => {
      mockDeliveryRepository.find.mockResolvedValue([{ id: 1 }]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(mockDeliveryRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if delivery does not exist', async () => {
      const qb = mockDeliveryRepository.createQueryBuilder();
      qb.getOne.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateHeader', () => {
    it('should update and return delivery', async () => {
      mockDeliveryRepository.preload.mockResolvedValue({ id: 1, updatedBy: 1 });
      mockDeliveryRepository.save.mockResolvedValue({ id: 1, updatedBy: 1 });
      const result = await service.updateHeader(1, {} as UpdateDeliveryDto, 1);
      expect(result).toBeDefined();
      if (result) {
        expect(result.id).toBe(1);
        expect(result.updatedBy).toBe(1);
      }
    });
  });

  describe('remove', () => {
    it('should increment stock of all products before removing delivery', async () => {
      const mockDelivery = {
        id: 1,
        details: [{ quantity: 5, product: { id: 10 } }],
      };
      queryRunnerMock.manager.findOne.mockResolvedValue(mockDelivery);

      await service.remove(1);

      expect(queryRunnerMock.manager.increment).toHaveBeenCalledWith(
        Product,
        { id: 10 },
        'quantity',
        5,
      );
      expect(queryRunnerMock.manager.remove).toHaveBeenCalled();
      expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
    });
  });

  // --- DELIVERIES-PRODUCT TEST (DETAILS) ---

  describe('addDetail', () => {
    it('should add a new detail and decrement product stock', async () => {
      queryRunnerMock.manager.findOne.mockResolvedValue({ id: 1 }); // Existe delivery
      // Mock de stock check
      const checkStockSpy = jest
        .spyOn(service as any, 'checkStockAvailability')
        .mockResolvedValue(undefined);

      queryRunnerMock.manager.save.mockResolvedValue({ id: 500 });

      await service.addDetail(1, 10, 5);

      expect(checkStockSpy).toHaveBeenCalled();
      expect(queryRunnerMock.manager.decrement).toHaveBeenCalledWith(
        Product,
        { id: 10 },
        'quantity',
        5,
      );
      expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
    });
  });

  describe('updateDetail', () => {
    it('should increment stock if new quantity is less than old quantity (delta < 0)', async () => {
      const oldDetail = { id: 1, quantity: 10, product: { id: 5 } };
      queryRunnerMock.manager.findOne.mockResolvedValue(oldDetail);

      // Nueva cantidad 4 (delta = -6). Debe devolver 6 al stock.
      await service.updateDetail(1, 4);

      expect(queryRunnerMock.manager.increment).toHaveBeenCalledWith(
        Product,
        { id: 5 },
        'quantity',
        6,
      );
    });

    it('should decrement stock if new quantity is more than old quantity (delta > 0)', async () => {
      const oldDetail = { id: 1, quantity: 10, product: { id: 5 } };
      queryRunnerMock.manager.findOne.mockResolvedValue(oldDetail);
      const checkStockSpy = jest
        .spyOn(service as any, 'checkStockAvailability')
        .mockResolvedValue(undefined);

      await service.updateDetail(1, 15);

      expect(checkStockSpy).toHaveBeenCalled();
      expect(queryRunnerMock.manager.decrement).toHaveBeenCalledWith(
        Product,
        { id: 5 },
        'quantity',
        5,
      );
    });
  });

  describe('removeDetail', () => {
    it('should return quantity to stock before deleting detail', async () => {
      const mockDetail = { id: 1, quantity: 8, product: { id: 20 } };
      queryRunnerMock.manager.findOne.mockResolvedValue(mockDetail);

      await service.removeDetail(1);

      expect(queryRunnerMock.manager.increment).toHaveBeenCalledWith(
        Product,
        { id: 20 },
        'quantity',
        8,
      );
      expect(queryRunnerMock.manager.remove).toHaveBeenCalled();
    });
  });
});
