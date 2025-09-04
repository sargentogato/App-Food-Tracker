import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Partial<User>> {
    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...createdUser } = await this.usersRepository.save(createUserDto);
    return createdUser;
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  findOneByUser(username: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ username });
  }

  update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    return this.usersRepository.save({ ...updateUserDto, id });
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
