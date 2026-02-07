import {
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { handleDbError } from './mysql-error-handler';

describe('handleDbError', () => {
  const action = 'creating user';

  it('should throw ConflictException (409) for duplicate entry (1062)', () => {
    const error = { errno: 1062 };

    expect(() => handleDbError(error, action)).toThrow(ConflictException);
  });

  it('should throw ConflictException (409) for foreign key constraint fails on delete (1451)', () => {
    const error = { errno: 1451 };

    expect(() => handleDbError(error, action)).toThrow(ConflictException);
  });

  it('should throw BadRequestException (400) for non-existent reference (1452)', () => {
    const error = { errno: 1452 };

    expect(() => handleDbError(error, action)).toThrow(BadRequestException);
  });

  it('should throw InternalServerErrorException for any other error', () => {
    const error = { errno: 999 };
    const randomError = new Error('Normal error');

    expect(() => handleDbError(error, action)).toThrow(InternalServerErrorException);
    expect(() => handleDbError(randomError, action)).toThrow(InternalServerErrorException);
  });
});
