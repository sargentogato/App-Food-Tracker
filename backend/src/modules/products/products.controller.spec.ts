import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';

describe('ProductsController', () => {
  let controller: ProductsController;

  // Service Mock
  const mockProductsService = {
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
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: mockProductsService }],
    })
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with correct data', async () => {
      const dto = { id_item: 1, batch_number: '123', expire_date: new Date(), quantity: 10 };
      const userId = 1;
      mockProductsService.create.mockResolvedValue({ id: 1, ...dto });

      const result = await controller.create(dto, userId);

      expect(mockProductsService.create).toHaveBeenCalledWith(dto, userId);
      expect(result.id).toBe(1);
    });
  });

  describe('findAll', () => {
    it('should return all Products from service', async () => {
      const Products = [
        { id: 1, id_item: 1, batch_number: '123', expire_date: new Date(), quantity: 10 },
        { id: 2, id_item: 2, batch_number: '124', expire_date: new Date(), quantity: 10 },
      ];
      mockProductsService.findAll.mockResolvedValue(Products);

      const result = await controller.findAll();

      expect(result).toEqual(Products);
      expect(mockProductsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should convert id string to number and call service.findOne', async () => {
      const id = '123';
      mockProductsService.findOne.mockResolvedValue({ id: 123, name: 'Product' });

      await controller.findOne(id);

      expect(mockProductsService.findOne).toHaveBeenCalledWith(123);
    });
  });

  describe('filter', () => {
    it('should call service.filter with query parameters', async () => {
      const query = { batch_number: '123', limit: 10, offset: 0 };
      mockProductsService.filter.mockResolvedValue({ data: [], meta: {} });

      await controller.filter(query);

      expect(mockProductsService.filter).toHaveBeenCalledWith(query);
    });
  });

  describe('update', () => {
    it('should convert id to number and call service.update with userId', async () => {
      const id = '5';
      const userId = 10;
      const updateDto = { batch_number: '987' };

      mockProductsService.update.mockResolvedValue({ id: 5, ...updateDto });

      const result = await controller.update(id, updateDto, userId);

      expect(mockProductsService.update).toHaveBeenCalledWith(5, updateDto, userId);
      expect(result.batch_number).toEqual('987');
    });
  });

  describe('remove', () => {
    it('should convert id to number and call service.remove', async () => {
      const id = '10';
      const deleteResult = { affected: 1 };
      mockProductsService.remove.mockResolvedValue(deleteResult);

      const result = await controller.remove(id);

      expect(mockProductsService.remove).toHaveBeenCalledWith(10);
      expect(result).toEqual(deleteResult);
    });
  });

  describe('ProductsController Errors', () => {
    it('should propagate NotFoundException from service', async () => {
      mockProductsService.findOne.mockRejectedValue(new NotFoundException('Not found'));

      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
    });

    it('should propagate InternalServerErrorException when service fails', async () => {
      mockProductsService.findAll.mockRejectedValue(
        new InternalServerErrorException('Unexpected error'),
      );

      await expect(controller.findAll()).rejects.toThrow(InternalServerErrorException);
    });
  });
});
