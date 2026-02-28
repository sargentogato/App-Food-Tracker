import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { GetUser } from 'src/core/decorators/get-user.decorator';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { Role } from '../user/enums/role.enum';
import { Roles } from 'src/core/decorators/roles.decorator';
import { Provider } from './entities/provider.entity';

@ApiTags('Providers')
@Controller('providers')
@UseGuards(RolesGuard)
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Post()
  @Roles(Role.SuperAdmin, Role.Admin)
  @ApiOperation({ summary: 'Create a new provider', description: 'Create a new provider' })
  @ApiBody({ type: CreateProviderDto })
  @ApiCookieAuth('auth-cookie')
  @ApiResponse({
    status: 201,
    description: 'The provider has been successfully created.',
    type: Provider,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
    schema: {
      example: {
        statusCode: 400,
        message: 'Bad Request',
        error: 'Bad Request',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Forbidden',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden',
        error: 'Forbidden',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal Server Error',
        error: 'Internal Server Error',
      },
    },
  })
  create(@Body() createProviderDto: CreateProviderDto, @GetUser('id') userId: number) {
    return this.providersService.create(createProviderDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all providers', description: 'Get all providers' })
  @ApiResponse({
    status: 200,
    description: 'The providers have been successfully fetched.',
    type: [Provider],
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal Server Error',
        error: 'Internal Server Error',
      },
    },
  })
  findAll() {
    return this.providersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a provider by id', description: 'Get a provider by id' })
  @ApiParam({ name: 'id', description: 'Provider id', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'The provider has been successfully fetched.',
    type: Provider,
  })
  @ApiNotFoundResponse({
    description: 'Not Found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Not Found',
        error: 'Not Found',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal Server Error',
        error: 'Internal Server Error',
      },
    },
  })
  findOne(@Param('id') id: string) {
    return this.providersService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.SuperAdmin, Role.Admin)
  @ApiOperation({ summary: 'Update a provider by id', description: 'Update a provider by id' })
  @ApiParam({ name: 'id', description: 'Provider id', type: 'number' })
  @ApiBody({ type: UpdateProviderDto })
  @ApiCookieAuth('auth-cookie')
  @ApiResponse({
    status: 200,
    description: 'The provider has been successfully updated.',
    type: Provider,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
    schema: {
      example: {
        statusCode: 400,
        message: 'Bad Request',
        error: 'Bad Request',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Forbidden',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden',
        error: 'Forbidden',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Not Found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Not Found',
        error: 'Not Found',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal Server Error',
        error: 'Internal Server Error',
      },
    },
  })
  update(
    @Param('id') id: string,
    @Body() updateProviderDto: UpdateProviderDto,
    @GetUser('id') userId: number,
  ) {
    return this.providersService.update(+id, updateProviderDto, userId);
  }

  @Delete(':id')
  @Roles(Role.SuperAdmin, Role.Admin)
  @ApiOperation({ summary: 'Delete a provider by id', description: 'Delete a provider by id' })
  @ApiParam({ name: 'id', description: 'Provider id', type: 'number' })
  @ApiCookieAuth('auth-cookie')
  @ApiResponse({
    status: 200,
    description: 'Provider deleted successfully.',
  })
  @ApiNotFoundResponse({
    description: 'Not Found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Not Found',
        error: 'Not Found',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal Server Error',
        error: 'Internal Server Error',
      },
    },
  })
  remove(@Param('id') id: string) {
    return this.providersService.remove(+id);
  }
}
