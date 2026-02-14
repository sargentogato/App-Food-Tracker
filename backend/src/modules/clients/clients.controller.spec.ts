import { Test, TestingModule } from '@nestjs/testing';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';

describe('ClientsController', () => {
  let controller: ClientsController;

  // Service Mock
  const mockClientService = {
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
      controllers: [ClientsController],
      providers: [{ provide: ClientsService, useValue: mockClientService }],
    })
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<ClientsController>(ClientsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with correct data', async () => {
      const dto = { name: 'test Client', contactName: 'John Doe' };
      const userId = 1;
      mockClientService.create.mockResolvedValue({ id: 1, ...dto });

      const result = await controller.create(dto, userId);

      expect(mockClientService.create).toHaveBeenCalledWith(dto, userId);
      expect(result.id).toBe(1);
    });
  });

  describe('findAll', () => {
    it('should return all clients from service', async () => {
      const clients = [
        { id: 1, name: 'Client 1' },
        { id: 2, name: 'Client 2' },
      ];
      mockClientService.findAll.mockResolvedValue(clients);

      const result = await controller.findAll();

      expect(result).toEqual(clients);
      expect(mockClientService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should convert id string to number and call service.findOne', async () => {
      const id = '123';
      mockClientService.findOne.mockResolvedValue({ id: 123, name: 'Client' });

      await controller.findOne(id);

      expect(mockClientService.findOne).toHaveBeenCalledWith(123);
    });
  });

  describe('update', () => {
    it('should convert id to number and call service.update with userId', async () => {
      const id = '5';
      const userId = 10;
      const updateDto = { name: 'Updated Name' };

      mockClientService.update.mockResolvedValue({ id: 5, ...updateDto });

      const result = await controller.update(id, updateDto, userId);

      expect(mockClientService.update).toHaveBeenCalledWith(5, updateDto, userId);
      expect(result.name).toEqual('Updated Name');
    });
  });

  describe('remove', () => {
    it('should convert id to number and call service.remove', async () => {
      const id = '10';
      const deleteResult = { affected: 1 };
      mockClientService.remove.mockResolvedValue(deleteResult);

      const result = await controller.remove(id);

      expect(mockClientService.remove).toHaveBeenCalledWith(10);
      expect(result).toEqual(deleteResult);
    });
  });

  describe('clientsController Errors', () => {
    it('should propagate NotFoundException from service', async () => {
      mockClientService.findOne.mockRejectedValue(new NotFoundException('Not found'));

      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
    });

    it('should propagate InternalServerErrorException when service fails', async () => {
      mockClientService.findAll.mockRejectedValue(
        new InternalServerErrorException('Unexpected error'),
      );

      await expect(controller.findAll()).rejects.toThrow(InternalServerErrorException);
    });
  });
});
