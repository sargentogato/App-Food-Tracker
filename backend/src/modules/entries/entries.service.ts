import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { DataSource, EntityManager, Repository } from 'typeorm';
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

  async updateHeader(id: number, updateEntryDto: UpdateEntryDto, userId: number) {
    const entry = await this.entryRepository.preload({
      id: id,
      ...updateEntryDto,
      updatedBy: userId,
    });

    if (!entry) throw new NotFoundException(`Entry #${id} not found`);

    try {
      return await this.entryRepository.save(entry);
    } catch (error) {
      handleDbError(error, 'update entry header');
    }
  }

  async remove(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entry = await queryRunner.manager.findOne(Entry, {
        where: { id },
        relations: { details: true },
      });

      if (!entry) throw new NotFoundException(`Entry with id ${id} not found`);

      for (const detail of entry.details) {
        await this.checkStockAvailability(queryRunner.manager, detail.product.id, detail.quantity);
      }

      for (const detail of entry.details) {
        await queryRunner.manager.decrement(
          Product,
          { id: detail.product.id },
          'quantity',
          detail.quantity,
        );
      }

      await queryRunner.manager.remove(Entry, entry);

      await queryRunner.commitTransaction();
      return { deleted: true, id };
    } catch (err) {
      await queryRunner.rollbackTransaction();

      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException('Error deleting entry: ' + err);
    } finally {
      await queryRunner.release();
    }
  }

  /*
    Details actions
  */

  async addDetail(entryId: number, productId: number, quantity: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entry = await queryRunner.manager.findOne(Entry, { where: { id: entryId } });
      if (!entry) throw new NotFoundException(`Entry #${entryId} not found`);

      const newDetail = queryRunner.manager.create(EntryProduct, {
        entry: { id: entryId },
        product: { id: productId },
        quantity: quantity,
      });
      const savedDetail = await queryRunner.manager.save(newDetail);

      await queryRunner.manager.increment(Product, { id: productId }, 'quantity', quantity);

      await queryRunner.commitTransaction();
      return savedDetail;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Error sdding detail: ' + err);
    } finally {
      await queryRunner.release();
    }
  }

  async updateDetail(detailId: number, quantity: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const detail = await queryRunner.manager.findOne(EntryProduct, {
        where: { id: detailId },
        relations: { product: true },
      });

      if (!detail) throw new NotFoundException('Detail not found');

      const delta = quantity - detail.quantity;

      detail.quantity = quantity;
      await queryRunner.manager.save(detail);

      if (delta > 0) {
        await queryRunner.manager.increment(Product, { id: detail.product.id }, 'quantity', delta);
      } else if (delta < 0) {
        const amountToSubtract = Math.abs(delta);
        await this.checkStockAvailability(queryRunner.manager, detail.product.id, amountToSubtract);

        await queryRunner.manager.decrement(
          Product,
          { id: detail.product.id },
          'quantity',
          amountToSubtract,
        );
      }

      await queryRunner.commitTransaction();
      return detail;
    } catch (err) {
      await queryRunner.rollbackTransaction();

      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException(err);
    } finally {
      await queryRunner.release();
    }
  }

  async removeDetail(detailId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const detail = await queryRunner.manager.findOne(EntryProduct, {
        where: { id: detailId },
        relations: { product: true },
      });

      if (!detail) throw new NotFoundException('Detail not found');

      await this.checkStockAvailability(queryRunner.manager, detail.product.id, detail.quantity);

      await queryRunner.manager.decrement(
        Product,
        { id: detail.product.id },
        'quantity',
        detail.quantity,
      );

      await queryRunner.manager.remove(detail);

      await queryRunner.commitTransaction();
      return { ok: true };
    } catch (err) {
      await queryRunner.rollbackTransaction();

      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException(err);
    } finally {
      await queryRunner.release();
    }
  }

  private async checkStockAvailability(
    manager: EntityManager,
    productId: number,
    quantityToSubtract: number,
  ) {
    const product = await manager.findOne(Product, {
      where: { id: productId },
      relations: { item: true },
    });

    if (!product) {
      throw new NotFoundException(`Product #${productId} not found`);
    }

    const itemName = product.item?.name || 'Producto sin nombre';
    if (product.quantity < quantityToSubtract) {
      throw new BadRequestException(
        `Operation denied: Stock of ${itemName} (${product.quantity}) ` +
          `is less than ${quantityToSubtract} required.`,
      );
    }
  }
}
