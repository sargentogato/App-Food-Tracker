import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Hello World!',
    description: 'Return a welcome message',
  })
  @ApiProduces('text/plain')
  @ApiResponse({ status: 200, description: 'Welcome message', type: String })
  getHello(): string {
    return this.appService.getHello();
  }
}
