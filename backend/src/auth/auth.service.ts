import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(username: string, pass: string, res): Promise<{ access_token: string }> {
    const user = await this.userService.findOneByUser(username);

    if (!user) {
      throw new UnauthorizedException();
    }

    const match = await bcrypt.compare(pass, user.password);
    if (!match) {
      throw new UnauthorizedException();
    }
    const payload = { id: user.id, username: user.username, role: user.role };

    const access_token = await this.jwtService.signAsync(payload);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    res.cookie('jwt', access_token, { httpOnly: true });

    return {
      access_token,
    };
  }
}
