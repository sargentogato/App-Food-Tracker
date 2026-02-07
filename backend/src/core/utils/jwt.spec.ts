import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { validateToken } from './jwt'; // Ajusta la ruta a tu archivo
import { Role } from 'src/modules/user/enums/role.enum';

// jsonwebtoken mock
jest.mock('jsonwebtoken');

describe('validateToken', () => {
  let mockConfigService: Partial<ConfigService>;
  const mockSecret = 'test-secret';

  beforeEach(() => {
    // Mock ConfigService
    mockConfigService = {
      get: jest.fn().mockReturnValue(mockSecret),
    };

    jest.clearAllMocks();

    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should return decoded user data when token is valid', () => {
    const mockUser = { id: 1, username: 'admin', role: Role.Admin };
    const token = 'valid-token';

    (jwt.verify as jest.Mock).mockReturnValue(mockUser);

    const result = validateToken(token, mockConfigService as ConfigService);

    expect(mockConfigService.get).toHaveBeenCalledWith('SECRET_KEY');
    expect(jwt.verify).toHaveBeenCalledWith(token, mockSecret);
    expect(result).toEqual(mockUser);
  });

  it('should return null and log error when token is invalid or expired', () => {
    const token = 'invalid-token';

    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('jwt expired');
    });

    const result = validateToken(token, mockConfigService as ConfigService);

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith('Token validation error:', expect.any(Error));
  });

  it('should return null if an unexpected error occurs', () => {
    const result = validateToken(null as unknown as string, mockConfigService as ConfigService);

    expect(result).toBeNull();
  });
});
