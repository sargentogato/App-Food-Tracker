import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Provider } from './entities/provider.entity';
import { DeleteResult, Repository } from 'typeorm';
import { handleDbError } from 'src/core/utils/mysql-error-handler';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider)
    private providersRepository: Repository<Provider>,
  ) {}

  async create(createProviderDto: CreateProviderDto, userId: number) {
    const createProvider = { ...createProviderDto, created_by: userId, updated_by: userId };

    try {
      return await this.providersRepository.save(createProvider);
    } catch (error: unknown) {
      return handleDbError(error, 'create provider');
    }
  }

  async findAll() {
    try {
      return await this.providersRepository.find();
    } catch (error: unknown) {
      return handleDbError(error, 'fetch providers');
    }
  }

  async findOne(id: number) {
    let provider: Provider | null;
    try {
      provider = await this.providersRepository.findOneBy({ id });
    } catch (error: unknown) {
      return handleDbError(error, `fetch provider with id ${id}`);
    }

    if (!provider) {
      throw new NotFoundException(`Provider with id ${id} not found`);
    }

    return provider;
  }

  async update(id: number, updateProviderDto: UpdateProviderDto, userId: number) {
    try {
      const updateProvider = { ...updateProviderDto, updated_by: userId };

      const result = await this.providersRepository.update(id, updateProvider);

      if (result.affected === 0) {
        throw new NotFoundException(`Provider with id ${id} not found`);
      }
      return this.findOne(id);
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;
      return handleDbError(error, `update provider with id ${id}`);
    }
  }

  async remove(id: number): Promise<DeleteResult> {
    try {
      const result = await this.providersRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Provider with id ${id} not found`);
      }
      return result;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;
      return handleDbError(error, `delete provider with id ${id}`);
    }
  }
}
