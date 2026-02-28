import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Item } from './entities/item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { FilterQueryItemDto } from './dto/filter-query-item.dto';
import { PaginationResult } from 'src/core/types/pagination-result';
import { handleDbError } from 'src/core/utils/mysql-error-handler';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private itemsRepository: Repository<Item>,
  ) {}

  async create(createItemDto: CreateItemDto, userId: number): Promise<Item> {
    const createItem = { ...createItemDto, created_by: userId, updated_by: userId };

    try {
      return await this.itemsRepository.save(createItem);
    } catch (error: unknown) {
      return handleDbError(error, 'create item');
    }
  }

  async findAll(): Promise<Item[]> {
    try {
      return await this.itemsRepository.find();
    } catch (error: unknown) {
      return handleDbError(error, 'fetch items');
    }
  }

  async findOne(id: number): Promise<Item> {
    let item: Item | null;
    try {
      item = await this.itemsRepository.findOneBy({ id });
    } catch (error: unknown) {
      return handleDbError(error, `fetch item with id ${id}`);
    }

    if (!item) {
      throw new NotFoundException(`Item with id ${id} not found`);
    }

    return item;
  }

  async filter(filterQueryItemDto: FilterQueryItemDto): Promise<PaginationResult<Item>> {
    const { name, category, limit = 10, offset = 0 } = filterQueryItemDto;

    const queryBuilder = this.itemsRepository.createQueryBuilder('items');

    if (name) {
      queryBuilder.andWhere('items.name LIKE :name', { name: `%${name}%` });
    }
    if (category) {
      queryBuilder.andWhere('items.category = :category', { category });
    }

    let items: Item[];
    let count: number;

    try {
      [items, count] = await queryBuilder
        .orderBy('items.created_at', 'ASC')
        .skip(offset)
        .take(limit)
        .orderBy('items.name', 'ASC')
        .getManyAndCount();
    } catch (error: unknown) {
      return handleDbError(error, 'fetch filtered items');
    }

    let newOffset = offset + limit;

    if (newOffset > count) {
      newOffset = count;
    }

    const result: PaginationResult<Item> = {
      data: items,
      meta: {
        total: count,
        offset: offset,
        limit: limit,
        nextOffset: newOffset >= count ? null : newOffset,
      },
    };

    return result;
  }

  async update(id: number, updateItemDto: UpdateItemDto, userId: number): Promise<Item> {
    try {
      const updateItem = { ...updateItemDto, updated_by: userId };

      const result = await this.itemsRepository.update(id, updateItem);

      if (result.affected === 0) {
        throw new NotFoundException(`Item with id ${id} not found`);
      }

      return this.findOne(id);
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;
      return handleDbError(error, `update item with id ${id}`);
    }
  }

  async remove(id: number): Promise<DeleteResult> {
    try {
      const result = await this.itemsRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Item with id ${id} not found`);
      }
      return result;
    } catch (error: unknown) {
      return handleDbError(error, `delete item with id ${id}`);
    }
  }
}
