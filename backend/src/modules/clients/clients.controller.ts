import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
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
import { Client } from './entities/client.entity';

@ApiTags('Clients')
@Controller('clients')
@UseGuards(RolesGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @Roles(Role.SuperAdmin, Role.Admin)
  @ApiOperation({ summary: 'Create a new client', description: 'Create a new client' })
  @ApiBody({ type: CreateClientDto })
  @ApiCookieAuth('auth-cookie')
  @ApiResponse({ status: 201, description: 'Client created successfully', type: Client })
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
  create(@Body() createClientDto: CreateClientDto, @GetUser('id') userId: number) {
    return this.clientsService.create(createClientDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all clients', description: 'Get all clients' })
  @ApiResponse({ status: 200, description: 'Clients fetched successfully', type: [Client] })
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
    return this.clientsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a client by id', description: 'Get a client by id' })
  @ApiParam({ name: 'id', description: 'Client id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Client fetched successfully', type: Client })
  @ApiNotFoundResponse({
    description: 'Client not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Client not found',
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
    return this.clientsService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.SuperAdmin, Role.Admin)
  @ApiOperation({ summary: 'Update a client by id', description: 'Update a client by id' })
  @ApiParam({ name: 'id', description: 'Client id', type: 'number' })
  @ApiBody({ type: UpdateClientDto })
  @ApiCookieAuth('auth-cookie')
  @ApiResponse({ status: 200, description: 'Client updated successfully', type: Client })
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
  update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
    @GetUser('id') userId: number,
  ) {
    return this.clientsService.update(+id, updateClientDto, userId);
  }

  @Delete(':id')
  @Roles(Role.SuperAdmin, Role.Admin)
  @ApiOperation({ summary: 'Delete a client by id', description: 'Delete a client by id' })
  @ApiParam({ name: 'id', description: 'Client id', type: 'number' })
  @ApiCookieAuth('auth-cookie')
  @ApiResponse({ status: 200, description: 'Client deleted successfully' })
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
    description: 'Client not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Client not found',
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
    return this.clientsService.remove(+id);
  }
}
