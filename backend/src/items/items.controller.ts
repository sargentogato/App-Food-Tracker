import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Item } from './entities/item.entity';
import {
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Items')
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new item', description: 'Create a new item' })
  @ApiBody({ type: CreateItemDto })
  @ApiResponse({
    status: 201,
    description: 'Item created successfully',
    type: Item,
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
  create(@Body() createItemDto: CreateItemDto) {
    return this.itemsService.create(createItemDto);
  }

  @Get()
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

  @Patch(':id')
  @ApiOperation({ summary: 'Update an item by id', description: 'Update an item by id' })
  @ApiParam({ name: 'id', description: 'Item Id', type: 'number' })
  @ApiBody({ type: UpdateItemDto })
  @ApiResponse({ status: 200, description: 'Item updated successfully', type: Item })
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
  update(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto) {
    return this.itemsService.update(+id, updateItemDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an item by id', description: 'Delete an item by id' })
  @ApiParam({ name: 'id', description: 'Item Id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Item deleted successfully', type: Item })
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
