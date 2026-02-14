import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.dto';
import { Response as ExpressResponse } from 'express';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    signIn: jest.fn(),
  };

  // ExpressResponse mock
  const mockResponse = {
    cookie: jest.fn(),
  } as unknown as ExpressResponse;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signin', () => {
    const signInDto: SignInDto = {
      username: 'testuser',
      password: 'password123',
    };

    it('should call authService.signIn and return loggedIn success', async () => {
      mockAuthService.signIn.mockResolvedValue({ access_token: 'fake-jwt' });

      const result = await controller.signin(signInDto, mockResponse);

      expect(mockAuthService.signIn).toHaveBeenCalledWith(
        signInDto.username,
        signInDto.password,
        mockResponse,
      );

      expect(result).toEqual({ loggedIn: true });
    });

    it('should propagate errors from authService', async () => {
      const errorMsg = 'Invalid credentials';
      mockAuthService.signIn.mockRejectedValue(new Error(errorMsg));

      await expect(controller.signin(signInDto, mockResponse)).rejects.toThrow(errorMsg);
    });
  });
});
