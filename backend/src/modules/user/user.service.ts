import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { handleDbError } from 'src/core/utils/mysql-error-handler';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Partial<User>> {
    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);

    let createdUser: Partial<User>;

    try {
      createdUser = await this.usersRepository.save(createUserDto);
    } catch (error) {
      return handleDbError(error, 'create user');
    }

    delete createdUser.password;
    return createdUser;
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.usersRepository.find();
    } catch (error: unknown) {
      return handleDbError(error, 'fetch users');
    }
  }

  async findOne(id: number): Promise<User> {
    let user: User | null;
    try {
      user = await this.usersRepository.findOneBy({ id });
    } catch (error: unknown) {
      return handleDbError(error, `fetch user with id ${id}`);
    }

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async findOneByUser(username: string): Promise<User> {
    let user: User | null;
    try {
      user = await this.usersRepository.findOneBy({ username });
    } catch (error: unknown) {
      return handleDbError(error, `fetch user with username ${username}`);
    }

    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const result = await this.usersRepository.update(id, updateUserDto);

      if (result.affected === 0) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      return this.findOne(id);
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;
      return handleDbError(error, `update user with id ${id}`);
    }
  }

  async remove(id: number): Promise<DeleteResult> {
    try {
      const result = await this.usersRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      return result;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;
      return handleDbError(error, `delete user with id ${id}`);
    }
  }
}
