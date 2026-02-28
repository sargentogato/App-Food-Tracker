import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { DeleteResult, ObjectLiteral, Repository, SelectQueryBuilder, UpdateResult } from 'typeorm';
import { Product } from './entities/product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { Item } from '../items/entities/item.entity';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';

type MockRepository<T extends ObjectLiteral> = Partial<Record<keyof Repository<T>, jest.Mock>>;
type MockQueryBuilder<T extends ObjectLiteral> = Partial<
  Record<keyof SelectQueryBuilder<T>, jest.Mock>
>;

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: MockRepository<Product>;
  let queryBuilder: MockQueryBuilder<Product>;

  // Result mocks
  const mockProduct = {
    id: 1,
    item: { id: 1, name: 'Item 1' } as Item,
    id_item: 1,
    batch_number: '123',
    expire_date: new Date(),
    quantity: 10,
  } as Product;

  beforeEach(async () => {
    queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<MockRepository<Product>>(getRepositoryToken(Product));
  });

  describe('create', () => {
    it('must save Product and return it', async () => {
      const dto: CreateProductDto = {
        id_item: 1,
        batch_number: '123',
        expire_date: new Date(),
        quantity: 10,
      };
      repository.save?.mockResolvedValue(mockProduct);

      const result = await service.create(dto, 1);

      expect(result).toEqual(mockProduct);
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ created_by: 1 }));
    });
  });

  describe('findAll', () => {
    it('must return an array of Products', async () => {
      const Products = [
        {
          id: 1,
          item: { id: 1, name: 'Item 1', created_by: 1 } as Item,
          id_item: 1,
          batch_number: '123',
          expire_date: new Date(),
          quantity: 10,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1,
        },
        {
          id: 2,
          item: { id: 2, name: 'Item 2', created_by: 1 } as Item,
          id_item: 2,
          batch_number: '124',
          expire_date: new Date(),
          quantity: 10,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1,
        },
      ] as Product[];

      repository.find!.mockResolvedValue(Products);

      const result = await service.findAll();

      expect(result).toEqual(Products);
      expect(result).toHaveLength(2);
      expect(repository.find).toHaveBeenCalledTimes(1);
    });

    it('must call handleDbError if an error occurs', async () => {
      // Force an error
      const dbError = new Error('DB Connection Error');
      repository.find!.mockRejectedValue(dbError);

      await expect(service.findAll()).rejects.toThrow(InternalServerErrorException);

      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('must return an Product', async () => {
      const mockProduct = {
        id: 1,
        id_item: 1,
        batch_number: '123',
        expire_date: new Date(),
        quantity: 10,
      } as Product;
      repository.findOne!.mockResolvedValue(mockProduct);

      const result = await service.findOne(1);

      expect(result).toEqual(mockProduct);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { item: true },
      });
    });

    it('must throw NotFoundException if Product not found', async () => {
      repository.findOne!.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow('Product with id 999 not found');
    });

    it('must call handleDbError if an error occurs', async () => {
      repository.findOne!.mockRejectedValue(new Error('Query Timeout'));

      await expect(service.findOne(1)).rejects.toThrow(InternalServerErrorException);

      expect(repository.findOne).toHaveBeenCalled();
    });
  });

  describe('filter', () => {
    it('must return filtered Products', async () => {
      const Products: Product[] = [mockProduct];
      const count = 1;

      (queryBuilder.getManyAndCount as jest.Mock).mockResolvedValue([Products, count]);

      const result = await service.filter({ limit: 10, offset: 0 });

      expect(result.data).toBe(Products);
      expect(result.meta.total).toBe(count);
    });
  });

  describe('update', () => {
    it('must throw NotFoundException if Product not found', async () => {
      const updateResult: UpdateResult = { raw: [], generatedMaps: [], affected: 0 };
      repository.update?.mockResolvedValue(updateResult);

      await expect(service.update(1, {}, 1)).rejects.toThrow(NotFoundException);
    });

    it('must update Product and return it', async () => {
      const updateResult: UpdateResult = { raw: [], generatedMaps: [], affected: 1 };
      repository.update?.mockResolvedValue(updateResult);
      repository.findOne?.mockResolvedValue(mockProduct);

      const result = await service.update(1, {}, 1);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('remove', () => {
    it('must return DeleteResult', async () => {
      const deleteResult: DeleteResult = { raw: [], affected: 1 };
      repository.delete?.mockResolvedValue(deleteResult);

      const result = await service.remove(1);
      expect(result.affected).toBe(1);
    });
  });
});
