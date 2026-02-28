import { Test, TestingModule } from '@nestjs/testing';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';

describe('ItemsController', () => {
  let controller: ItemsController;

  // Service Mock
  const mockItemsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    filter: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  // Guard Mock
  const mockRolesGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [{ provide: ItemsService, useValue: mockItemsService }],
    })
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<ItemsController>(ItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with correct data', async () => {
      const dto = { name: 'Test Item', category: 'General', description: '' };
      const userId = 1;
      mockItemsService.create.mockResolvedValue({ id: 1, ...dto });

      const result = await controller.create(dto, userId);

      expect(mockItemsService.create).toHaveBeenCalledWith(dto, userId);
      expect(result.id).toBe(1);
    });
  });

  describe('findAll', () => {
    it('should return all items from service', async () => {
      const items = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ];
      mockItemsService.findAll.mockResolvedValue(items);

      const result = await controller.findAll();

      expect(result).toEqual(items);
      expect(mockItemsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should convert id string to number and call service.findOne', async () => {
      const id = '123';
      mockItemsService.findOne.mockResolvedValue({ id: 123, name: 'Item' });

      await controller.findOne(id);

      expect(mockItemsService.findOne).toHaveBeenCalledWith(123);
    });
  });

  describe('filter', () => {
    it('should call service.filter with query parameters', async () => {
      const query = { name: 'phone', limit: 10, offset: 0 };
      mockItemsService.filter.mockResolvedValue({ data: [], meta: {} });

      await controller.filter(query);

      expect(mockItemsService.filter).toHaveBeenCalledWith(query);
    });
  });

  describe('update', () => {
    it('should convert id to number and call service.update with userId', async () => {
      const id = '5';
      const userId = 10;
      const updateDto = { name: 'Updated Name' };

      mockItemsService.update.mockResolvedValue({ id: 5, ...updateDto });

      const result = await controller.update(id, updateDto, userId);

      expect(mockItemsService.update).toHaveBeenCalledWith(5, updateDto, userId);
      expect(result.name).toEqual('Updated Name');
    });
  });

  describe('remove', () => {
    it('should convert id to number and call service.remove', async () => {
      const id = '10';
      const deleteResult = { affected: 1 };
      mockItemsService.remove.mockResolvedValue(deleteResult);

      const result = await controller.remove(id);

      expect(mockItemsService.remove).toHaveBeenCalledWith(10);
      expect(result).toEqual(deleteResult);
    });
  });

  describe('ItemsController Errors', () => {
    it('should propagate NotFoundException from service', async () => {
      mockItemsService.findOne.mockRejectedValue(new NotFoundException('Not found'));

      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
    });

    it('should propagate InternalServerErrorException when service fails', async () => {
      mockItemsService.findAll.mockRejectedValue(
        new InternalServerErrorException('Unexpected error'),
      );

      await expect(controller.findAll()).rejects.toThrow(InternalServerErrorException);
    });
  });
});
