import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { DeleteResult, Repository } from 'typeorm';
import { handleDbError } from 'src/core/utils/mysql-error-handler';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
  ) {}

  async create(createClientDto: CreateClientDto, userId: number) {
    const createClient = { ...createClientDto, created_by: userId, updated_by: userId };

    try {
      return await this.clientsRepository.save(createClient);
    } catch (error: unknown) {
      return handleDbError(error, 'create client');
    }
  }

  async findAll() {
    try {
      return await this.clientsRepository.find();
    } catch (error: unknown) {
      return handleDbError(error, 'fetch clients');
    }
  }

  async findOne(id: number) {
    let client: Client | null;
    try {
      client = await this.clientsRepository.findOneBy({ id });
    } catch (error: unknown) {
      return handleDbError(error, `fetch client with id ${id}`);
    }

    if (!client) {
      throw new NotFoundException(`Client with id ${id} not found`);
    }

    return client;
  }

  async update(id: number, updateClientDto: UpdateClientDto, userId: number) {
    try {
      const updateClient = { ...updateClientDto, updated_by: userId };

      const result = await this.clientsRepository.update(id, updateClient);

      if (result.affected === 0) {
        throw new NotFoundException(`Client with id ${id} not found`);
      }
      return this.findOne(id);
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;
      return handleDbError(error, `update client with id ${id}`);
    }
  }

  async remove(id: number): Promise<DeleteResult> {
    try {
      const result = await this.clientsRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Client with id ${id} not found`);
      }
      return result;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;
      return handleDbError(error, `delete client with id ${id}`);
    }
  }
}
