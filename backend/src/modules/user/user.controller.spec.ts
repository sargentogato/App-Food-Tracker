import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Role } from './enums/role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request as ExpressRequest } from 'express';
import { ConfigService } from '@nestjs/config';
import * as jwtUtils from 'src/core/utils/jwt';
import { DeleteResult } from 'typeorm';

// External functions mock
jest.mock('src/core/utils/jwt', () => ({
  validateToken: jest.fn(),
}));

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;

  const mockUserService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUser = {
    id: 1,
    username: 'test',
    full_name: 'test',
    email: 'a@a.com',
    password: '123',
    role: Role.User,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call userService.create', async () => {
      const dto: CreateUserDto = {
        username: 'new',
        full_name: 'new',
        password: '123',
        email: 'a@a.com',
        role: Role.User,
      };
      userService.create.mockResolvedValue(mockUser);

      const result = await controller.create(dto);

      expect(userService['create']).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      userService.findAll.mockResolvedValue([mockUser]);
      const result = await controller.findAll();
      expect(result).toEqual([mockUser]);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      userService.findOne.mockResolvedValue(mockUser);
      const result = await controller.findOne('1');
      expect(userService['findOne']).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    const updateDto: UpdateUserDto = { username: 'updated' };

    // Mock ExpressRequest
    const createMockReq = (jwt?: string) =>
      ({
        cookies: { jwt },
      }) as unknown as ExpressRequest;

    it('should return null if no jwt cookie exists', async () => {
      const result = await controller.update('1', updateDto, createMockReq());
      expect(result).toBeNull();
    });

    it('should return null if token is invalid', async () => {
      (jwtUtils.validateToken as jest.Mock).mockReturnValue(null);
      const result = await controller.update('1', updateDto, createMockReq('invalid-token'));
      expect(result).toBeNull();
    });

    it('should allow update if user is SuperAdmin', async () => {
      (jwtUtils.validateToken as jest.Mock).mockReturnValue({ id: 99, role: Role.SuperAdmin });
      userService.update.mockResolvedValue({ ...mockUser, ...updateDto });

      const result = await controller.update('1', updateDto, createMockReq('valid-token'));

      expect(userService['update']).toHaveBeenCalledWith(1, updateDto);
      expect(result?.username).toBe('updated');
    });

    it('should allow update if user is updating their own profile', async () => {
      (jwtUtils.validateToken as jest.Mock).mockReturnValue({ id: 1, role: Role.User });
      const expectedResult = { ...mockUser, ...updateDto };
      userService.update.mockResolvedValue({ ...mockUser, ...updateDto });

      const result = await controller.update('1', updateDto, createMockReq('token-propio'));

      expect(userService['update']).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(expectedResult);
    });

    it('should return null if User tries to update another User', async () => {
      (jwtUtils.validateToken as jest.Mock).mockReturnValue({ id: 2, role: Role.User });

      const result = await controller.update('1', updateDto, createMockReq('token-ajeno'));

      expect(userService['update']).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should call userService.remove', async () => {
      userService.remove.mockResolvedValue({ affected: 1 } as DeleteResult);
      await controller.remove('1');
      expect(userService['remove']).toHaveBeenCalledWith(1);
    });
  });
});
