import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;

  // TypeORM mock
  const mockUserRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should hash password and save user (removing password from response)', async () => {
      const createUserDto = {
        username: 'test',
        full_name: 'test',
        password: '123',
        email: 't@t.com',
      };
      const savedUser = { id: 1, ...createUserDto };

      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashed_pass') as never);
      mockUserRepository.save.mockResolvedValue(savedUser);

      const result = await service.create(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('123', 10);
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result.password).toBeUndefined();
      expect(result.username).toBe('test');
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      const user = { id: 1, username: 'test' };
      mockUserRepository.findOneBy.mockResolvedValue(user);

      const result = await service.findOne(1);

      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [
        { id: 1, username: 'user1' },
        { id: 2, username: 'user2' },
      ];
      mockUserRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(mockUserRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOneByUser', () => {
    it('should return a user if username exists', async () => {
      const user = { id: 1, username: 'found_user' };
      mockUserRepository.findOneBy.mockResolvedValue(user);

      const result = await service.findOneByUser('found_user');

      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ username: 'found_user' });
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if username is not found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOneByUser('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneByUser', () => {
    it('should find user by username', async () => {
      const user = { id: 1, username: 'test' };
      mockUserRepository.findOneBy.mockResolvedValue(user);

      const result = await service.findOneByUser('test');

      expect(repository['findOneBy']).toHaveBeenCalledWith({ username: 'test' });
      expect(result).toEqual(user);
    });
  });

  describe('update', () => {
    it('should update and return the updated user', async () => {
      const updateUserDto = { username: 'new' };
      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      mockUserRepository.findOneBy.mockResolvedValue({ id: 1, ...updateUserDto });

      const result = await service.update(1, updateUserDto);

      expect(result.username).toBe('new');
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, updateUserDto);
    });

    it('should throw NotFoundException if no user was affected', async () => {
      mockUserRepository.update.mockResolvedValue({ affected: 0 });

      await expect(service.update(1, { username: 'new' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a user and return result', async () => {
      mockUserRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);

      expect(result.affected).toBe(1);
    });

    it('should throw NotFoundException if delete affected 0 rows', async () => {
      mockUserRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });

    it('should call handleDbError when repository fails', async () => {
      mockUserRepository.find.mockRejectedValue(new Error('DB Fail'));

      await expect(service.findAll()).rejects.toThrow();
    });
  });
});
