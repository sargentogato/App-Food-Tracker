import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { DataSource, Repository } from 'typeorm';
import { Entry } from './entities/entry.entity';
import { EntryProduct } from './entities/entryProduct.entity';
import { Product } from '../products/entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { handleDbError } from 'src/core/utils/mysql-error-handler';

@Injectable()
export class EntriesService {
  constructor(
    @InjectRepository(Entry)
    private readonly entryRepository: Repository<Entry>,

    private dataSource: DataSource,
  ) {}

  async create(createEntryDto: CreateEntryDto, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entry = queryRunner.manager.create(Entry, {
        ...createEntryDto,
        createdBy: userId,
        updatedBy: userId,
      });
      const savedEntry = await queryRunner.manager.save(entry);

      for (const item of createEntryDto.products) {
        const detail = queryRunner.manager.create(EntryProduct, {
          entry: savedEntry,
          product: { id: item.productId },
          quantity: item.quantity,
        });
        await queryRunner.manager.save(detail);

        await queryRunner.manager.increment(
          Product,
          { id: item.productId },
          'quantity',
          item.quantity,
        );
      }

      await queryRunner.commitTransaction();
      return savedEntry;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Error procesando la entrada: ' + err);
    } finally {
      await queryRunner.release();
    }
  }

  findAll() {
    try {
      return this.entryRepository.find({
        relations: { provider: true, details: { product: true } },
        order: { createdAt: 'DESC' },
      });
    } catch (error: unknown) {
      return handleDbError(error, 'fetch entries');
    }
  }

  async findOne(id: number) {
    let entry: Entry | null;
    try {
      entry = await this.entryRepository
        .createQueryBuilder('entry')
        .innerJoinAndSelect('entry.provider', 'provider')
        .innerJoinAndSelect('entry.details', 'details')
        .innerJoinAndSelect('details.product', 'product')
        .where('entry.id = :id', { id })
        .orderBy('entry.createdAt', 'DESC')
        .getOne();
    } catch (error: unknown) {
      return handleDbError(error, `fetch entry with id ${id}`);
    }

    if (!entry) {
      throw new NotFoundException(`Entry with id ${id} not found`);
    }

    return entry;
  }

  update(id: number, updateEntryDto: UpdateEntryDto) {
    console.log(updateEntryDto);
    return `This action updates a #${id} entry`;
  }

  remove(id: number) {
    return `This action removes a #${id} entry`;
  }
}
