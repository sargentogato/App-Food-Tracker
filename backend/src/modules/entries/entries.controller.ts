import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { EntriesService } from './entries.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { Role } from '../user/enums/role.enum';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { Roles } from 'src/core/decorators/roles.decorator';
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
import { Entry } from './entities/entry.entity';
import { EntryProduct } from './entities/entryProduct.entity';
import { FilterQueryEntryDto } from './dto/filter-query-entry.dto';

@ApiTags('Entries')
@Controller('entries')
@UseGuards(RolesGuard)
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @Post()
  @Roles(Role.SuperAdmin, Role.Admin)
  @ApiOperation({ summary: 'Create a new entry', description: 'Create a new entry' })
  @ApiBody({ type: CreateEntryDto })
  @ApiCookieAuth('auth-cookie')
  @ApiResponse({
    status: 201,
    description: 'The entry has been successfully created.',
    type: Entry,
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
  create(@Body() createEntryDto: CreateEntryDto, @GetUser('id') userId: number) {
    return this.entriesService.create(createEntryDto, userId);
  }

  @Get('get/all')
  @ApiOperation({ summary: 'Get all entries', description: 'Get all entries' })
  @ApiResponse({
    status: 200,
    description: 'All entries',
    type: [Entry],
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
    return this.entriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one entry', description: 'Get one entry' })
  @ApiParam({ name: 'id', description: 'Entry Id', type: Number, required: true })
  @ApiResponse({
    status: 200,
    description: 'One entry',
    type: Entry,
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
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.entriesService.findOne(id);
  }

  @Get('')
  @ApiOperation({ summary: 'Filter entries', description: 'Filter entries' })
  @ApiResponse({
    status: 200,
    description: 'Entries obtained successfully',
    schema: {
      example: {
        data: [Entry],
        meta: {
          total: 0,
          offset: 0,
          limit: 0,
          nextOffset: null,
        },
      },
    },
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
  filter(@Query() filterQueryEntryDto: FilterQueryEntryDto) {
    return this.entriesService.filter(filterQueryEntryDto);
  }

  @Patch(':id')
  @Roles(Role.SuperAdmin, Role.Admin)
  @ApiOperation({
    summary: 'Update one entry',
    description: 'Update one entry, only data of the header, not the details',
  })
  @ApiParam({ name: 'id', description: 'Entry Id', type: Number })
  @ApiBody({ type: UpdateEntryDto })
  @ApiCookieAuth('auth-cookie')
  @ApiResponse({
    status: 200,
    description: 'The entry has been successfully updated.',
    type: Entry,
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
  updateHeader(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEntryDto: UpdateEntryDto,
    @GetUser('id') userId: number,
  ) {
    return this.entriesService.updateHeader(id, updateEntryDto, userId);
  }

  @Delete(':id')
  @Roles(Role.SuperAdmin, Role.Admin)
  @ApiOperation({
    summary: 'Delete one entry',
    description:
      'Delete one entry. If the stock of any product is not enough, the entry will not be deleted',
  })
  @ApiParam({ name: 'id', description: 'Entry Id', type: Number })
  @ApiCookieAuth('auth-cookie')
  @ApiResponse({
    status: 200,
    description: 'The entry has been successfully deleted.',
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
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.entriesService.remove(id);
  }

  // --- MÉTODOS DE LOS DETALLES (ENTRY PRODUCTS) ---

  @Post(':id/details')
  @Roles(Role.SuperAdmin, Role.Admin)
  @ApiOperation({
    summary: 'Add a detail to an entry',
    description: 'Add a detail to an entry',
  })
  @ApiParam({ name: 'id', description: 'Entry Id', type: Number })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        productId: { type: 'number' },
        quantity: { type: 'number' },
      },
    },
  })
  @ApiCookieAuth('auth-cookie')
  @ApiResponse({
    status: 200,
    description: 'The detail has been successfully added.',
    type: EntryProduct,
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
  addDetail(
    @Param('id', ParseIntPipe) entryId: number,
    @Body('productId', ParseIntPipe) productId: number,
    @Body('quantity', ParseIntPipe) quantity: number,
  ) {
    return this.entriesService.addDetail(entryId, productId, quantity);
  }

  @Patch('details/:detailId')
  @Roles(Role.SuperAdmin, Role.Admin)
  @ApiOperation({
    summary: 'Update a detail of an entry',
    description:
      'Update a detail of an entry. If the stock of any product is not enough, the detail will not be updated',
  })
  @ApiParam({ name: 'detailId', description: 'Detail Id', type: Number })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        quantity: { type: 'number' },
      },
    },
  })
  @ApiCookieAuth('auth-cookie')
  @ApiResponse({
    status: 200,
    description: 'The detail has been successfully updated.',
    type: EntryProduct,
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
  updateDetail(
    @Param('detailId', ParseIntPipe) detailId: number,
    @Body('quantity', ParseIntPipe) quantity: number,
  ) {
    return this.entriesService.updateDetail(detailId, quantity);
  }

  @Delete('details/:detailId')
  @Roles(Role.SuperAdmin, Role.Admin)
  @ApiOperation({
    summary: 'Remove a detail of an entry',
    description:
      'Remove a detail of an entry. If the stock of any product is not enough, the detail will not be removed',
  })
  @ApiParam({ name: 'detailId', description: 'Detail Id', type: Number })
  @ApiCookieAuth('auth-cookie')
  @ApiResponse({
    status: 200,
    description: 'The detail has been successfully removed.',
    type: Boolean,
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
  removeDetail(@Param('detailId', ParseIntPipe) detailId: number) {
    return this.entriesService.removeDetail(detailId);
  }
}
