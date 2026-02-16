import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { DeleteResult, Repository } from 'typeorm';
import { handleDbError } from 'src/core/utils/mysql-error-handler';
import { FilterQueryProductsDto } from './dto/filter-query-products.dto';
import { PaginationResult } from 'src/core/types/pagination-result';

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

  async findAll() {
    try {
      return await this.productsRepository.find({
        relations: { item: true },
      });
    } catch (error: unknown) {
      return handleDbError(error, 'fetch products');
    }
  }

  async findOne(id: number) {
    let product: Product | null;
    try {
      product = await this.productsRepository.findOne({
        where: { id },
        relations: { item: true },
      });
    } catch (error: unknown) {
      return handleDbError(error, `fetch product with id ${id}`);
    }

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  async filter(filterQueryProductsDto: FilterQueryProductsDto): Promise<PaginationResult<Product>> {
    const { item_name, batch_number, expire_date, limit = 10, offset = 0 } = filterQueryProductsDto;

    const queryBuilder = this.productsRepository
      .createQueryBuilder('products')
      .leftJoinAndSelect('products.item', 'item');

    queryBuilder.andWhere('products.quantity > 0');

    if (item_name) {
      queryBuilder.andWhere('item.name LIKE :item_name', { item_name: `%${item_name}%` });
    }
    if (batch_number) {
      queryBuilder.andWhere('products.batch_number LIKE :batch_number', {
        batch_number: `%${batch_number}%`,
      });
    }
    if (expire_date) {
      queryBuilder.andWhere('products.expire_date < :expire_date', { expire_date });
    }

    let products: Product[];
    let count: number;

    try {
      [products, count] = await queryBuilder
        .orderBy('products.created_at', 'ASC')
        .skip(offset)
        .take(limit)
        .orderBy('item.name', 'ASC')
        .addOrderBy('products.expire_date', 'ASC')
        .getManyAndCount();
    } catch (error: unknown) {
      return handleDbError(error, 'fetch filtered products');
    }

    let newOffset = offset + limit;

    if (newOffset > count) {
      newOffset = count;
    }

    const result: PaginationResult<Product> = {
      data: products,
      meta: {
        total: count,
        offset,
        limit,
        nextOffset: newOffset > count ? null : newOffset,
      },
    };

    return result;
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
