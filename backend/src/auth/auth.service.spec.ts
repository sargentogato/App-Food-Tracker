import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserService } from '../modules/user/user.service';
import { User } from 'src/modules/user/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;

  // Response Express mock
  const mockResponse = {
    cookie: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: { findOneByUser: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      password: 'hashedPassword',
      role: 'admin',
    };

    it('should return an access_token and set a cookie on success', async () => {
      // 1. Arrange
      userService.findOneByUser.mockResolvedValue(mockUser as User);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jwtService.signAsync.mockResolvedValue('fake_token');

      // 2. Act
      const result = await service.signIn('testuser', 'password123', mockResponse);

      // 3. Assert
      expect(result).toEqual({ access_token: 'fake_token' });
      expect(mockResponse['cookie']).toHaveBeenCalledWith('jwt', 'fake_token', { httpOnly: true });
      expect(jwtService['signAsync']).toHaveBeenCalledWith({
        id: mockUser.id,
        username: mockUser.username,
        role: mockUser.role,
      });
    });

    it('should throw NotFoundException if user does not exist (propagated from UserService)', async () => {
      userService.findOneByUser.mockRejectedValue(new NotFoundException('User not found'));

      await expect(service.signIn('nonexistent', 'pass', mockResponse)).rejects.toThrow(
        NotFoundException,
      );

      expect(jwtService['signAsync']).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      userService.findOneByUser.mockResolvedValue(mockUser as User);
      // bcrypt returns false
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.signIn('testuser', 'wrongpass', mockResponse)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if JWT signing fails', async () => {
      userService.findOneByUser.mockResolvedValue(mockUser as User);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      // Force signed error
      jwtService.signAsync.mockRejectedValue(new Error('Sign error'));

      await expect(service.signIn('testuser', 'pass', mockResponse)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
