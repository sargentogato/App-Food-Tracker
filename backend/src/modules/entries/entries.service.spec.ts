import { Test, TestingModule } from '@nestjs/testing';
import { EntriesService } from './entries.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Entry } from './entities/entry.entity';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Product } from '../products/entities/product.entity';

describe('EntriesService', () => {
  let service: EntriesService;
  let module: TestingModule;

  // Mock del QueryRunner para las transacciones
  const queryRunnerMock = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findOne: jest.fn(),
      increment: jest.fn(),
      decrement: jest.fn(),
      remove: jest.fn(),
    },
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        EntriesService,
        {
          provide: getRepositoryToken(Entry),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            preload: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              innerJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getOne: jest.fn(),
            })),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue(queryRunnerMock),
          },
        },
      ],
    }).compile();

    service = module.get<EntriesService>(EntriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- TESTS DE CABECERA ---

  describe('findOne', () => {
    it('should throw NotFoundException if entry does not exist', async () => {
      const repo = module.get<Repository<Entry>>(getRepositoryToken(Entry));

      const queryBuilderMock = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      } as unknown as SelectQueryBuilder<Entry>; // <--- Casting seguro

      jest.spyOn(repo, 'createQueryBuilder').mockReturnValue(queryBuilderMock);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  // --- TESTS DE DETALLES Y STOCK ---

  describe('updateDetail (Stock Control)', () => {
    it('should throw BadRequestException if reducing quantity below current stock', async () => {
      const mockDetail = { id: 1, quantity: 100, product: { id: 99 } };
      const mockProduct = { id: 99, quantity: 10, item: { name: 'Test' } };

      queryRunnerMock.manager.findOne
        .mockResolvedValueOnce(mockDetail) // Primero busca el detalle
        .mockResolvedValueOnce(mockProduct); // Luego busca el producto para validar stock

      // Intentamos bajar de 100 a 20 (delta -80), pero solo hay 10 en stock real
      await expect(service.updateDetail(1, 20)).rejects.toThrow(BadRequestException);
      expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
    });

    it('should increment stock if new quantity is higher (positive delta)', async () => {
      const mockDetail = { id: 1, quantity: 10, product: { id: 99 } };
      queryRunnerMock.manager.findOne.mockResolvedValueOnce(mockDetail);

      await service.updateDetail(1, 15); // Delta +5

      expect(queryRunnerMock.manager.increment).toHaveBeenCalledWith(
        Product,
        { id: 99 },
        'quantity',
        5,
      );
      expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
    });
  });

  describe('removeDetail', () => {
    it('should revert stock and delete detail', async () => {
      const mockDetail = { id: 1, quantity: 50, product: { id: 99 } };
      const mockProduct = { id: 99, quantity: 100 };

      queryRunnerMock.manager.findOne
        .mockResolvedValueOnce(mockDetail)
        .mockResolvedValueOnce(mockProduct);

      await service.removeDetail(1);

      expect(queryRunnerMock.manager.decrement).toHaveBeenCalledWith(
        Product,
        { id: 99 },
        'quantity',
        50,
      );
      expect(queryRunnerMock.manager.remove).toHaveBeenCalled();
    });
  });

  describe('remove (Complete Entry)', () => {
    it('should rollback if one product in the list lacks enough stock', async () => {
      const mockEntry = {
        id: 1,
        details: [
          { quantity: 10, product: { id: 101 } },
          { quantity: 50, product: { id: 102 } },
        ],
      };

      queryRunnerMock.manager.findOne
        .mockResolvedValueOnce(mockEntry)
        .mockResolvedValueOnce({ id: 101, quantity: 100 })
        .mockResolvedValueOnce({ id: 102, quantity: 20 });

      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
      expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
    });
  });
});
