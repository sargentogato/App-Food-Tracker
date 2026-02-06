import {
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { MySqlError } from '../types/my-sql-errors';

export const handleDbError = (error: unknown, action: string): never => {
  if (typeof error === 'object' && error !== null && 'errno' in error) {
    const mysqlError = error as MySqlError;

    switch (mysqlError.errno) {
      case 1062:
        throw new ConflictException(`Duplicate entry while ${action}`);
      case 1451:
        throw new ConflictException(`Item cannot be deleted: it is referenced elsewhere`);
      case 1452:
        throw new BadRequestException(`Referenced record does not exist while ${action}`);
    }
  }

  throw new InternalServerErrorException(`Unexpected error while ${action}`);
};
