import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { DeleteResult, Repository } from 'typeorm';
import { handleDbError } from 'src/core/utils/mysql-error-handler';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto, userId: number) {
    try {
      return await this.productsRepository.save({
        ...createProductDto,
        created_by: userId,
        updated_by: userId,
      });
    } catch (error: unknown) {
      return handleDbError(error, 'create product');
    }
  }

  findAll() {
    return `This action returns all products`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  async update(id: number, updateProductDto: UpdateProductDto, userId: number) {
    try {
      const updateProduct = { ...updateProductDto, updated_by: userId };

      const result = await this.productsRepository.update(id, updateProduct);

      if (result.affected === 0) {
        throw new NotFoundException(`Product with id ${id} not found`);
      }
      return this.findOne(id);
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;
      return handleDbError(error, `update product with id ${id}`);
    }
  }

  async remove(id: number): Promise<DeleteResult> {
    try {
      const result = await this.productsRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Product with id ${id} not found`);
      }
      return result;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;
      return handleDbError(error, `delete product with id ${id}`);
    }
  }
}
