// entries.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { EntriesService } from './entries.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Entry } from './entities/entry.entity';
import { EntryProduct } from './entities/entryProduct.entity';
import { Product } from '../products/entities/product.entity';
import { DataSource } from 'typeorm';
import {
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateEntryDto } from './dto/create-entry.dto';

describe('EntriesService', () => {
  let service: EntriesService;

  let mockQueryResult: any = null;

  // Mocks de Repositorios
  const mockEntryRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    preload: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockImplementation(() => Promise.resolve(mockQueryResult)),
    }),
  };

  const mockEntryProductRepository = {
    findOne: jest.fn(),
  };

  // Mock de QueryRunner para Transacciones
  const queryRunnerMock = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      create: jest.fn(),
      save: jest.fn(),
      increment: jest.fn(),
      decrement: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn(() => queryRunnerMock),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntriesService,
        { provide: getRepositoryToken(Entry), useValue: mockEntryRepository },
        { provide: getRepositoryToken(EntryProduct), useValue: mockEntryProductRepository },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<EntriesService>(EntriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- TESTS DE FUNCIONES PRINCIPALES ---

  describe('create', () => {
    it('must create an entry and his details', async () => {
      const dto = { products: [{ productId: 1, quantity: 10 }] };
      const userId = 1;

      queryRunnerMock.manager.create.mockReturnValueOnce({ id: 100 }); // Entry
      queryRunnerMock.manager.save.mockResolvedValueOnce({ id: 100 }); // Save Entry

      const result = await service.create(dto as unknown as CreateEntryDto, userId);

      expect(queryRunnerMock.startTransaction).toHaveBeenCalled();
      expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
      expect(result).toEqual({ id: 100 });
    });

    it('must rollback on failure', async () => {
      queryRunnerMock.manager.save.mockRejectedValueOnce(new Error('DB Error'));

      await expect(
        service.create({ products: [] } as unknown as CreateEntryDto, 1),
      ).rejects.toThrow(InternalServerErrorException);

      expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('must return all entries', async () => {
      const entries = [{ id: 1 }, { id: 2 }];
      mockEntryRepository.find.mockResolvedValue(entries);

      const result = await service.findAll();
      expect(result).toEqual(entries);
    });
  });

  describe('findOne', () => {
    it('must return one entry', async () => {
      const entry = { id: 1, description: 'Test Entry' };
      mockQueryResult = entry;

      const result = await service.findOne(1);

      expect(result).toEqual(entry);
      expect(mockEntryRepository.createQueryBuilder).toHaveBeenCalledWith('entry');
    });

    it('must throw NotFoundException if entry does not exist', async () => {
      mockQueryResult = null; // Simulamos que no encontró nada

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateHeader', () => {
    it('must update and return entry header', async () => {
      mockEntryRepository.preload.mockResolvedValue({ id: 1 });
      mockEntryRepository.save.mockResolvedValue({ id: 1, updatedBy: 1 });

      const result = await service.updateHeader(1, {} as unknown as CreateEntryDto, 1);
      if (result) {
        expect(result.updatedBy).toBe(1);
      }
    });
  });

  describe('remove', () => {
    it('must remove an entry and decrement stock', async () => {
      const mockEntry = {
        id: 1,
        details: [{ product: { id: 1, quantity: 20 }, quantity: 5 }],
      };
      queryRunnerMock.manager.findOne.mockResolvedValue(mockEntry);

      // Mock del stock check interno
      queryRunnerMock.manager.findOne.mockResolvedValueOnce(mockEntry); // find entry
      queryRunnerMock.manager.findOne.mockResolvedValueOnce({ id: 1, quantity: 20 }); // find product for stock check

      const result = await service.remove(1);

      expect(queryRunnerMock.manager.decrement).toHaveBeenCalled();
      expect(queryRunnerMock.manager.remove).toHaveBeenCalled();
      expect(result.deleted).toBe(true);
    });
  });

  describe('addDetail', () => {
    it('must increment stock and create detail', async () => {
      queryRunnerMock.manager.findOne.mockResolvedValue({ id: 1 }); // entry
      queryRunnerMock.manager.create.mockReturnValue({});
      queryRunnerMock.manager.save.mockResolvedValue({ id: 50 });
      mockEntryProductRepository.findOne.mockResolvedValue({ id: 50, quantity: 10 });

      const result = await service.addDetail(1, 1, 10);

      expect(queryRunnerMock.manager.increment).toHaveBeenCalled();
      if (result) {
        expect(result.quantity).toBe(10);
        expect(result.id).toBe(50);
      }
    });
  });

  describe('updateDetail', () => {
    it('must increment stock if delta > 0', async () => {
      const oldDetail = { id: 1, quantity: 5, product: { id: 10 } };
      queryRunnerMock.manager.findOne.mockResolvedValue(oldDetail);

      await service.updateDetail(1, 15); // Delta +10

      expect(queryRunnerMock.manager.increment).toHaveBeenCalledWith(
        Product,
        { id: 10 },
        'quantity',
        10,
      );
    });

    it('must throw BadRequestException if delta < 0', async () => {
      const oldDetail = { id: 1, quantity: 20, product: { id: 10 } };
      queryRunnerMock.manager.findOne.mockResolvedValueOnce(oldDetail); // find detail
      queryRunnerMock.manager.findOne.mockResolvedValueOnce({ id: 10, quantity: 2 }); // find product (stock bajo)

      await expect(service.updateDetail(1, 10)).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeDetail', () => {
    it('must decrement stock and remove detail', async () => {
      const detail = { id: 1, quantity: 5, product: { id: 10 } };
      queryRunnerMock.manager.findOne.mockResolvedValueOnce(detail); // find detail
      queryRunnerMock.manager.findOne.mockResolvedValueOnce({ id: 10, quantity: 10 }); // check stock

      const result = await service.removeDetail(1);

      expect(queryRunnerMock.manager.decrement).toHaveBeenCalled();
      expect(result.ok).toBe(true);
    });
  });
});
