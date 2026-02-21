import { Test, TestingModule } from '@nestjs/testing';
import { ProvidersService } from './providers.service';
import { DeleteResult, ObjectLiteral, Repository, UpdateResult } from 'typeorm';
import { Provider } from './entities/provider.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateProviderDto } from './dto/create-provider.dto';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';

type MockRepository<T extends ObjectLiteral> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('ProvidersService', () => {
  let service: ProvidersService;
  let repository: MockRepository<Provider>;

  // Result mocks
  const mockProvider = {
    id: 1,
    name: 'Provider 1',
    contactName: 'Contact 1',
    phone: '123456789',
    email: 'tHs2c@example.com',
    address: 'Address 1',
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 1,
    updated_by: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProvidersService,
        {
          provide: getRepositoryToken(Provider),
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProvidersService>(ProvidersService);
    repository = module.get<MockRepository<Provider>>(getRepositoryToken(Provider));
  });

  describe('create', () => {
    it('must save Provider and return it', async () => {
      const dto: CreateProviderDto = {
        name: 'Provider 1',
        contactName: 'Contact 1',
        phone: '123456789',
        email: 'tHs2c@example.com',
        address: 'Address 1',
      };
      repository.save?.mockResolvedValue(mockProvider);

      const result = await service.create(dto, 1);

      expect(result).toEqual(mockProvider);
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ created_by: 1 }));
    });
  });

  describe('findAll', () => {
    it('must return an array of Providers', async () => {
      const Providers = [
        {
          id: 1,
          name: 'Provider 1',
          contactName: 'Contact 1',
          phone: '123456789',
          email: 'tHs2c@example.com',
          address: 'Address 1',
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1,
        },
        {
          id: 2,
          name: 'Provider 2',
          contactName: 'Contact 2',
          phone: '123456780',
          email: 'tHs2d@example.com',
          address: 'Address 2',
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1,
        },
      ] as Provider[];

      repository.find!.mockResolvedValue(Providers);

      const result = await service.findAll();

      expect(result).toEqual(Providers);
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
    it('must return a Provider', async () => {
      const mockProvider = {
        id: 1,
        name: 'Provider 1',
        contactName: 'Contact 1',
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
        updated_by: 1,
      };
      repository.findOneBy!.mockResolvedValue(mockProvider);

      const result = await service.findOne(1);

      expect(result).toEqual(mockProvider);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('must throw NotFoundException if Provider not found', async () => {
      repository.findOneBy!.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow('Provider with id 999 not found');
    });

    it('must call handleDbError if an error occurs', async () => {
      repository.findOneBy!.mockRejectedValue(new Error('Query Timeout'));

      await expect(service.findOne(1)).rejects.toThrow(InternalServerErrorException);

      expect(repository.findOneBy).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('must throw NotFoundException if Provider not found', async () => {
      const updateResult: UpdateResult = { raw: [], generatedMaps: [], affected: 0 };
      repository.update?.mockResolvedValue(updateResult);

      await expect(service.update(1, {}, 1)).rejects.toThrow(NotFoundException);
    });

    it('must update Provider and return it', async () => {
      const updateResult: UpdateResult = { raw: [], generatedMaps: [], affected: 1 };
      repository.update?.mockResolvedValue(updateResult);
      repository.findOneBy?.mockResolvedValue(mockProvider);

      const result = await service.update(1, {}, 1);
      expect(result).toEqual(mockProvider);
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
