import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Delivery } from './entities/delivery.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeliveryProduct } from './entities/deliveryProduct.entity';
import { Product } from '../products/entities/product.entity';
import { handleDbError } from 'src/core/utils/mysql-error-handler';
import { FilterQueryDeliveryDto } from './dto/filter-query-delivery.dto';
import { PaginationResult } from 'src/core/types/pagination-result';

@Injectable()
export class DeliveriesService {
  constructor(
    @InjectRepository(Delivery)
    private readonly deliveriesRepository: Repository<Delivery>,
    @InjectRepository(DeliveryProduct)
    private readonly deliveryProductRepository: Repository<DeliveryProduct>,

    private dataSource: DataSource,
  ) {}

  async create(createDeliveryDto: CreateDeliveryDto, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const delivery = queryRunner.manager.create(Delivery, {
        ...createDeliveryDto,
        createdBy: userId,
        updatedBy: userId,
      });
      const savedDelivery = await queryRunner.manager.save(delivery);

      for (const item of createDeliveryDto.products) {
        await this.checkStockAvailability(queryRunner.manager, item.product_id, item.quantity);

        const detail = queryRunner.manager.create(DeliveryProduct, {
          delivery: savedDelivery,
          product: { id: item.product_id },
          quantity: item.quantity,
        });
        await queryRunner.manager.save(detail);

        await queryRunner.manager.decrement(
          Product,
          { id: item.product_id },
          'quantity',
          item.quantity,
        );
      }

      await queryRunner.commitTransaction();
      return savedDelivery;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  findAll() {
    try {
      return this.deliveriesRepository.find({
        relations: { client: true, details: { product: { item: true } } },
        order: { createdAt: 'DESC' },
      });
    } catch (error: unknown) {
      return handleDbError(error, 'fetch deliveries');
    }
  }

  async findOne(id: number) {
    let delivery: Delivery | null;
    try {
      delivery = await this.deliveriesRepository
        .createQueryBuilder('deliveries')
        .leftJoinAndSelect('deliveries.client', 'clients')
        .leftJoinAndSelect('deliveries.details', 'deliveries_products')
        .leftJoinAndSelect('deliveries_products.product', 'products')
        .leftJoinAndSelect('products.item', 'item')
        .where('deliveries.id = :id', { id })
        .getOne();
    } catch (error: unknown) {
      return handleDbError(error, `fetch delivery with id ${id}`);
    }

    if (!delivery) {
      throw new NotFoundException(`Delivery with id ${id} not found`);
    }

    return delivery;
  }

  async filter(filterQueryEntryDto: FilterQueryDeliveryDto) {
    const { dateStart, dateEnd, clientId, limit = 10, offset = 0 } = filterQueryEntryDto;

    const queryBuilder = this.deliveriesRepository.createQueryBuilder('deliveries');

    queryBuilder
      .leftJoinAndSelect('deliveries.client', 'clients')
      .leftJoinAndSelect('deliveries.details', 'deliveries_products')
      .leftJoinAndSelect('deliveries_products.product', 'products')
      .leftJoinAndSelect('products.item', 'item');

    if (dateStart) {
      queryBuilder.andWhere('deliveries.createdAt >= :dateStart', { dateStart });
    }
    if (dateEnd) {
      queryBuilder.andWhere('deliveries.createdAt <= :dateEnd', { dateEnd });
    }
    if (clientId) {
      queryBuilder.andWhere('deliveries.client = :clientId', { clientId });
    }

    let deliveries: Delivery[];
    let count: number;

    try {
      [deliveries, count] = await queryBuilder
        .orderBy('deliveries.createdAt', 'ASC')
        .skip(offset)
        .take(limit)
        .getManyAndCount();
    } catch (error: unknown) {
      return handleDbError(error, 'fetch filtered deliveries');
    }

    let newOffset = offset + limit;

    if (newOffset > count) {
      newOffset = count;
    }

    const result: PaginationResult<Delivery> = {
      data: deliveries,
      meta: {
        total: count,
        offset,
        limit,
        nextOffset: newOffset >= count ? null : newOffset,
      },
    };

    return result;
  }

  async updateHeader(id: number, updateDeliveryDto: UpdateDeliveryDto, userId: number) {
    const delivery = await this.deliveriesRepository.preload({
      id: id,
      ...updateDeliveryDto,
      updatedBy: userId,
    });

    if (!delivery) throw new NotFoundException(`Delivery #${id} not found`);

    try {
      return await this.deliveriesRepository.save(delivery);
    } catch (error) {
      handleDbError(error, 'update delivery header');
    }
  }

  async remove(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const delivery = await queryRunner.manager.findOne(Delivery, {
        where: { id: id },
        relations: { details: { product: true } },
      });

      if (!delivery) throw new NotFoundException(`Delivery #${id} not found`);

      for (const detail of delivery.details) {
        await queryRunner.manager.increment(
          Product,
          { id: detail.product.id },
          'quantity',
          detail.quantity,
        );
      }

      await queryRunner.manager.remove(delivery);

      await queryRunner.commitTransaction();
      return { deleted: true, id };
    } catch (err) {
      await queryRunner.rollbackTransaction();

      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException('Error deleting delivery: ' + err);
    } finally {
      await queryRunner.release();
    }
  }

  /*
    Details actions
  */

  async addDetail(detailId: number, productId: number, quantity: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const delivery = await queryRunner.manager.findOne(Delivery, {
        where: { id: detailId },
      });
      if (!delivery) throw new NotFoundException(`Delivery #${detailId} not found`);

      await this.checkStockAvailability(queryRunner.manager, productId, quantity);

      const newDetail = queryRunner.manager.create(DeliveryProduct, {
        delivery: { id: detailId },
        product: { id: productId },
        quantity: quantity,
      });
      const savedDetail = await queryRunner.manager.save(newDetail);

      await queryRunner.manager.decrement(Product, { id: productId }, 'quantity', quantity);

      await queryRunner.commitTransaction();

      return await this.deliveryProductRepository.findOne({
        where: { id: savedDetail.id },
        relations: { product: true },
      });
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
      const detail = await queryRunner.manager.findOne(DeliveryProduct, {
        where: { id: detailId },
        relations: { product: true },
      });
      if (!detail) throw new NotFoundException('Detail not found');

      const delta = quantity - detail.quantity;

      detail.quantity = quantity;
      await queryRunner.manager.save(detail);

      if (delta > 0) {
        await this.checkStockAvailability(queryRunner.manager, detail.product.id, delta);

        await queryRunner.manager.decrement(Product, { id: detail.product.id }, 'quantity', delta);
      } else if (delta < 0) {
        const amountToAdd = Math.abs(delta);

        await queryRunner.manager.increment(
          Product,
          { id: detail.product.id },
          'quantity',
          amountToAdd,
        );
      }

      await queryRunner.commitTransaction();

      return await this.deliveryProductRepository.findOne({
        where: { id: detailId },
        relations: { product: true },
      });
    } catch (err) {
      await queryRunner.rollbackTransaction();

      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException('Error updating detail: ' + err);
    } finally {
      await queryRunner.release();
    }
  }

  async removeDetail(detailId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const detail = await queryRunner.manager.findOne(DeliveryProduct, {
        where: { id: detailId },
        relations: { product: true },
      });

      if (!detail) throw new NotFoundException('Detail not found');

      await queryRunner.manager.increment(
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

      throw new InternalServerErrorException('Error removing detail: ' + err);
    } finally {
      await queryRunner.release();
    }
  }

  /*
    Private methods
  */

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
