import { Body, Controller, Post, Response } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  async signin(@Body() signInDto: SignInDto, @Response({ passthrough: true }) res) {
    const { access_token } = await this.authService.signIn(signInDto.username, signInDto.password, res);

    return {
      loggedIn: true,
    };
  }
}
