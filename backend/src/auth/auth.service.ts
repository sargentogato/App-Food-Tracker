import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../modules/user/user.service';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(username: string, pass: string, res: Response): Promise<{ access_token: string }> {
    const user = await this.userService.findOneByUser(username);

    if (!user) {
      throw new UnauthorizedException();
    }

    const match = await bcrypt.compare(pass, user.password);
    if (!match) {
      throw new UnauthorizedException();
    }
    const payload = { id: user.id, username: user.username, role: user.role };

    let access_token: string;
    try {
      access_token = await this.jwtService.signAsync(payload);
    } catch (error) {
      throw new UnauthorizedException(`Error fetching token: ${error}`);
    }

    if (!access_token) {
      throw new UnauthorizedException();
    }

    res.cookie('jwt', access_token, { httpOnly: true });

    return {
      access_token,
    };
  }
}
