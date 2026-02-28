import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from './clients.service';
import { DeleteResult, ObjectLiteral, Repository, UpdateResult } from 'typeorm';
import { Client } from './entities/client.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateClientDto } from './dto/create-client.dto';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';

type MockRepository<T extends ObjectLiteral> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('ClientsService', () => {
  let service: ClientsService;
  let repository: MockRepository<Client>;

  // Result mocks
  const mockClient = {
    id: 1,
    name: 'Client 1',
    contactName: 'Contact 1',
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 1,
    updated_by: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: getRepositoryToken(Client),
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

    service = module.get<ClientsService>(ClientsService);
    repository = module.get<MockRepository<Client>>(getRepositoryToken(Client));
  });

  describe('create', () => {
    it('must save client and return it', async () => {
      const dto: CreateClientDto = { name: 'Client 1', contactName: 'Contact 1' };
      repository.save?.mockResolvedValue(mockClient);

      const result = await service.create(dto, 1);

      expect(result).toEqual(mockClient);
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ created_by: 1 }));
    });
  });

  describe('findAll', () => {
    it('must return an array of clients', async () => {
      const clients = [
        {
          id: 1,
          name: 'Client 1',
          contactName: 'Contact 1',
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1,
        },
        {
          id: 2,
          name: 'Client 2',
          contactName: 'Contact 2',
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1,
        },
      ] as Client[];

      repository.find!.mockResolvedValue(clients);

      const result = await service.findAll();

      expect(result).toEqual(clients);
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
    it('must return a client', async () => {
      const mockClient = {
        id: 1,
        name: 'Client 1',
        contactName: 'Contact 1',
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
        updated_by: 1,
      };
      repository.findOneBy!.mockResolvedValue(mockClient);

      const result = await service.findOne(1);

      expect(result).toEqual(mockClient);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('must throw NotFoundException if client not found', async () => {
      repository.findOneBy!.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow('Client with id 999 not found');
    });

    it('must call handleDbError if an error occurs', async () => {
      repository.findOneBy!.mockRejectedValue(new Error('Query Timeout'));

      await expect(service.findOne(1)).rejects.toThrow(InternalServerErrorException);

      expect(repository.findOneBy).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('must throw NotFoundException if client not found', async () => {
      const updateResult: UpdateResult = { raw: [], generatedMaps: [], affected: 0 };
      repository.update?.mockResolvedValue(updateResult);

      await expect(service.update(1, {}, 1)).rejects.toThrow(NotFoundException);
    });

    it('must update client and return it', async () => {
      const updateResult: UpdateResult = { raw: [], generatedMaps: [], affected: 1 };
      repository.update?.mockResolvedValue(updateResult);
      repository.findOneBy?.mockResolvedValue(mockClient);

      const result = await service.update(1, {}, 1);
      expect(result).toEqual(mockClient);
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
