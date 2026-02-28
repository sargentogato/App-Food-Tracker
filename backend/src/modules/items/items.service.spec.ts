import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, DeleteResult, UpdateResult, ObjectLiteral } from 'typeorm';
import { ItemsService } from './items.service';
import { Item } from './entities/item.entity';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';

type MockRepository<T extends ObjectLiteral> = Partial<Record<keyof Repository<T>, jest.Mock>>;
type MockQueryBuilder<T extends ObjectLiteral> = Partial<
  Record<keyof SelectQueryBuilder<T>, jest.Mock>
>;

describe('ItemsService', () => {
  let service: ItemsService;
  let repository: MockRepository<Item>;
  let queryBuilder: MockQueryBuilder<Item>;

  // Result mocks
  const mockItem = { id: 1, name: 'Test', category: 'Test' } as Item;

  beforeEach(async () => {
    queryBuilder = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemsService,
        {
          provide: getRepositoryToken(Item),
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
          },
        },
      ],
    }).compile();

    service = module.get<ItemsService>(ItemsService);
    repository = module.get<MockRepository<Item>>(getRepositoryToken(Item));
  });

  describe('create', () => {
    it('must save item and return it', async () => {
      const dto: CreateItemDto = { name: 'New Item', description: '', category: '' };
      repository.save?.mockResolvedValue(mockItem);

      const result = await service.create(dto, 1);

      expect(result).toEqual(mockItem);
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ created_by: 1 }));
    });
  });

  describe('findAll', () => {
    it('must return an array of items', async () => {
      const items: Item[] = [
        { id: 1, name: 'Item 1', created_by: 1 } as Item,
        { id: 2, name: 'Item 2', created_by: 1 } as Item,
      ];

      repository.find!.mockResolvedValue(items);

      const result = await service.findAll();

      expect(result).toEqual(items);
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
    it('must return an item', async () => {
      const mockItem = { id: 1, name: 'Item 1' } as Item;
      repository.findOneBy!.mockResolvedValue(mockItem);

      const result = await service.findOne(1);

      expect(result).toEqual(mockItem);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('must throw NotFoundException if item not found', async () => {
      repository.findOneBy!.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow('Item with id 999 not found');
    });

    it('must call handleDbError if an error occurs', async () => {
      repository.findOneBy!.mockRejectedValue(new Error('Query Timeout'));

      await expect(service.findOne(1)).rejects.toThrow(InternalServerErrorException);

      expect(repository.findOneBy).toHaveBeenCalled();
    });
  });

  describe('filter', () => {
    it('must return filtered items', async () => {
      const items: Item[] = [mockItem];
      const count = 1;

      (queryBuilder.getManyAndCount as jest.Mock).mockResolvedValue([items, count]);

      const result = await service.filter({ limit: 10, offset: 0 });

      expect(result.data).toBe(items);
      expect(result.meta.total).toBe(count);
    });
  });

  describe('update', () => {
    it('must throw NotFoundException if item not found', async () => {
      const updateResult: UpdateResult = { raw: [], generatedMaps: [], affected: 0 };
      repository.update?.mockResolvedValue(updateResult);

      await expect(service.update(1, {}, 1)).rejects.toThrow(NotFoundException);
    });

    it('must update item and return it', async () => {
      const updateResult: UpdateResult = { raw: [], generatedMaps: [], affected: 1 };
      repository.update?.mockResolvedValue(updateResult);
      repository.findOneBy?.mockResolvedValue(mockItem);

      const result = await service.update(1, {}, 1);
      expect(result).toEqual(mockItem);
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
