import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Item } from './entities/item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private itemsRepository: Repository<Item>,
  ) {}
  create(createItemDto: CreateItemDto) {
    return this.itemsRepository.save(createItemDto);
  }

  findAll(): Promise<Item[]> {
    return this.itemsRepository.find();
  }

  findOne(id: number): Promise<Item | null> {
    return this.itemsRepository.findOneBy({ id });
  }

  update(id: number, updateItemDto: UpdateItemDto): Promise<Item> {
    return this.itemsRepository.save({ ...updateItemDto, id });
  }

  remove(id: number): Promise<DeleteResult> {
    return this.itemsRepository.delete(id);
  }
}
