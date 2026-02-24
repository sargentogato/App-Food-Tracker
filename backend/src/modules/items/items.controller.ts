import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Item } from './entities/item.entity';
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
import { FilterQueryItemDto } from './dto/filter-query-item.dto';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { Role } from '../user/enums/role.enum';
import { Roles } from 'src/core/decorators/roles.decorator';
import { GetUser } from 'src/core/decorators/get-user.decorator';

@ApiTags('Items')
@Controller('items')
@UseGuards(RolesGuard)
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @Roles(Role.SuperAdmin, Role.Admin)
  @ApiOperation({ summary: 'Create a new item', description: 'Create a new item' })
  @ApiBody({ type: CreateItemDto })
  @ApiCookieAuth('auth-cookie')
  @ApiResponse({
    status: 201,
    description: 'Item created successfully',
    type: Item,
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
  create(@Body() createItemDto: CreateItemDto, @GetUser('id') userId: number) {
    return this.itemsService.create(createItemDto, userId);
  }

  @Get('get/all')
  @ApiOperation({ summary: 'Get all items', description: 'Get all items' })
  @ApiResponse({ status: 200, description: 'Items obtained successfully', type: [Item] })
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
    return this.itemsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an item by id', description: 'Get an item by id' })
  @ApiParam({ name: 'id', description: 'Item Id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Item obtained successfully', type: Item })
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
    return this.itemsService.findOne(+id);
  }

  @Get('')
  @ApiOperation({ summary: 'Get items by filter', description: 'Get items by filter' })
  @ApiResponse({
    status: 200,
    description: 'Items obtained successfully',
    schema: {
      example: {
        data: [Item],
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
  filter(@Query() filterQueryItemDto: FilterQueryItemDto) {
    return this.itemsService.filter(filterQueryItemDto);
  }

  @Patch(':id')
  @Roles(Role.SuperAdmin, Role.Admin)
  @ApiOperation({ summary: 'Update an item by id', description: 'Update an item by id' })
  @ApiParam({ name: 'id', description: 'Item Id', type: 'number' })
  @ApiBody({ type: UpdateItemDto })
  @ApiCookieAuth('auth-cookie')
  @ApiResponse({ status: 200, description: 'Item updated successfully', type: Item })
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
    @Body() updateItemDto: UpdateItemDto,
    @GetUser('id') userId: number,
  ) {
    return this.itemsService.update(+id, updateItemDto, userId);
  }

  @Delete(':id')
  @Roles(Role.SuperAdmin, Role.Admin)
  @ApiOperation({ summary: 'Delete an item by id', description: 'Delete an item by id' })
  @ApiParam({ name: 'id', description: 'Item Id', type: 'number' })
  @ApiCookieAuth('auth-cookie')
  @ApiResponse({ status: 200, description: 'Item deleted successfully.' })
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
  remove(@Param('id') id: string) {
    return this.itemsService.remove(+id);
  }
}
