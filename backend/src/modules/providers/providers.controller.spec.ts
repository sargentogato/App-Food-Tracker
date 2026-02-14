import { Test, TestingModule } from '@nestjs/testing';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';

describe('ProvidersController', () => {
  let controller: ProvidersController;

  // Service Mock
  const mockProviderService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  // Guard Mock
  const mockRolesGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProvidersController],
      providers: [{ provide: ProvidersService, useValue: mockProviderService }],
    })
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<ProvidersController>(ProvidersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with correct data', async () => {
      const dto = {
        name: 'test Provider',
        contactName: 'John Doe',
        phone: '123456789',
        email: 'a@a.com',
        address: '123 Main St',
      };
      const userId = 1;
      mockProviderService.create.mockResolvedValue({ id: 1, ...dto });

      const result = await controller.create(dto, userId);

      expect(mockProviderService.create).toHaveBeenCalledWith(dto, userId);
      expect(result.id).toBe(1);
    });
  });

  describe('findAll', () => {
    it('should return all Providers from service', async () => {
      const Providers = [
        {
          id: 1,
          name: 'Provider 1',
          contactName: 'John Doe',
          phone: '123456789',
          email: 'a@a.com',
          address: '123 Main St',
        },
        {
          id: 2,
          name: 'Provider 2',
          contactName: 'John Dos',
          phone: '123456789',
          email: 'a@a.com',
          address: '123 Main St',
        },
      ];
      mockProviderService.findAll.mockResolvedValue(Providers);

      const result = await controller.findAll();

      expect(result).toEqual(Providers);
      expect(mockProviderService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should convert id string to number and call service.findOne', async () => {
      const id = '123';
      mockProviderService.findOne.mockResolvedValue({ id: 123, name: 'Provider' });

      await controller.findOne(id);

      expect(mockProviderService.findOne).toHaveBeenCalledWith(123);
    });
  });

  describe('update', () => {
    it('should convert id to number and call service.update with userId', async () => {
      const id = '5';
      const userId = 10;
      const updateDto = { name: 'Updated Name' };

      mockProviderService.update.mockResolvedValue({ id: 5, ...updateDto });

      const result = await controller.update(id, updateDto, userId);

      expect(mockProviderService.update).toHaveBeenCalledWith(5, updateDto, userId);
      expect(result.name).toEqual('Updated Name');
    });
  });

  describe('remove', () => {
    it('should convert id to number and call service.remove', async () => {
      const id = '10';
      const deleteResult = { affected: 1 };
      mockProviderService.remove.mockResolvedValue(deleteResult);

      const result = await controller.remove(id);

      expect(mockProviderService.remove).toHaveBeenCalledWith(10);
      expect(result).toEqual(deleteResult);
    });
  });

  describe('ProvidersController Errors', () => {
    it('should propagate NotFoundException from service', async () => {
      mockProviderService.findOne.mockRejectedValue(new NotFoundException('Not found'));

      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
    });

    it('should propagate InternalServerErrorException when service fails', async () => {
      mockProviderService.findAll.mockRejectedValue(
        new InternalServerErrorException('Unexpected error'),
      );

      await expect(controller.findAll()).rejects.toThrow(InternalServerErrorException);
    });
  });
});
