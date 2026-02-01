import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Item } from './entities/item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { FilterQueryItemDto } from './dto/filter-query-item.dto';
import { PaginationResult } from 'src/core/types/pagination-result';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private itemsRepository: Repository<Item>,
  ) {}
  create(createItemDto: CreateItemDto, userId: number): Promise<Item> {
    const createItem = { ...createItemDto, created_by: userId, updated_by: userId };

    return this.itemsRepository.save(createItem);
  }

  findAll(): Promise<Item[]> {
    return this.itemsRepository.find();
  }

  findOne(id: number): Promise<Item | null> {
    return this.itemsRepository.findOneBy({ id });
  }

  async filter(filterQueryItemDto: FilterQueryItemDto): Promise<PaginationResult<Item>> {
    const { name, category, limit = 10, offset = 0 } = filterQueryItemDto;

    const queryBuilder = this.itemsRepository.createQueryBuilder('items');

    if (name) {
      queryBuilder.where('items.name LIKE :name', { name: `%${name}%` });
    }
    if (category) {
      queryBuilder.where('items.category = :category', { category });
    }
    const [items, count] = await queryBuilder
      .orderBy('items.created_at', 'ASC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

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

  update(id: number, updateItemDto: UpdateItemDto, userId: number): Promise<Item> {
    const updateItem = { ...updateItemDto, updated_by: userId };

    return this.itemsRepository.save({ ...updateItem, id });
  }

  remove(id: number): Promise<DeleteResult> {
    return this.itemsRepository.delete(id);
  }
}
