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
import { DeliveriesService } from './deliveries.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
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
import { GetUser } from 'src/core/decorators/get-user.decorator';
import { Delivery } from './entities/delivery.entity';
import { DeliveryProduct } from './entities/deliveryProduct.entity';
import { FilterQueryDeliveryDto } from './dto/filter-query-delivery.dto';

@ApiTags('Deliveries')
@Controller('deliveries')
@UseGuards(RolesGuard)
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Post()
  @Roles(Role.SuperAdmin, Role.Admin)
  @ApiOperation({
    summary: 'Create delivery',
    description:
      'Create delivery. If stock of any product is not enough, the delivery will not be created.',
  })
  @ApiBody({ type: CreateDeliveryDto })
  @ApiCookieAuth('auth-cookie')
  @ApiResponse({
    status: 201,
    description: 'The delivery has been successfully created.',
    type: CreateDeliveryDto,
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
  create(@Body() createDeliveryDto: CreateDeliveryDto, @GetUser('id') userId: number) {
    return this.deliveriesService.create(createDeliveryDto, userId);
  }

  @Get('get/all')
  @ApiOperation({ summary: 'Get all deliveries', description: 'Get all deliveries' })
  @ApiResponse({
    status: 200,
    description: 'The deliveries have been successfully fetched.',
    type: [CreateDeliveryDto],
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
    return this.deliveriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get delivery by id', description: 'Get delivery by id' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Delivery id',
    required: true,
  })
  @ApiNotFoundResponse({
    description: 'Delivery not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Delivery not found',
        error: 'Delivery not found',
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
    return this.deliveriesService.findOne(+id);
  }

  @Get('')
  @ApiOperation({ summary: 'Filter deliveries', description: 'Filter deliveries' })
  @ApiResponse({
    status: 200,
    description: 'Deliveries obtained successfully',
    schema: {
      example: {
        data: [Delivery],
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
  filter(@Query() filterQueryDeliveryDto: FilterQueryDeliveryDto) {
    return this.deliveriesService.filter(filterQueryDeliveryDto);
  }

  @Patch(':id')
  @Roles(Role.SuperAdmin, Role.Admin)
  @ApiOperation({
    summary: 'Update delivery',
    description: 'Update delivery, only data of the header will be updated',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Delivery id',
    required: true,
  })
  @ApiBody({ type: UpdateDeliveryDto })
  @ApiCookieAuth('auth-cookie')
  @ApiResponse({
    status: 200,
    description: 'The delivery has been successfully updated.',
    type: Delivery,
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
    description: 'Delivery not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Delivery not found',
        error: 'Delivery not found',
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
    @Body() updateDeliveryDto: UpdateDeliveryDto,
    @GetUser('id') userId: number,
  ) {
    return this.deliveriesService.updateHeader(id, updateDeliveryDto, userId);
  }

  @Delete(':id')
  @Roles(Role.SuperAdmin, Role.Admin)
  @ApiOperation({ summary: 'Delete delivery', description: 'Delete delivery' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Delivery id',
    required: true,
  })
  @ApiCookieAuth('auth-cookie')
  @ApiResponse({
    status: 200,
    description: 'The delivery has been successfully deleted.',
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
    description: 'Delivery not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Delivery not found',
        error: 'Delivery not found',
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
    return this.deliveriesService.remove(id);
  }

  // --- MÉTODOS DE LOS DETALLES (DELIVERY PRODUCTS) ---

  @Post(':id/details')
  @Roles(Role.SuperAdmin, Role.Admin)
  @ApiOperation({
    summary: 'Add a detail to an delivery',
    description:
      'Add a detail to an delivery. If the stock of any product is not enough, the detail will not be removed',
  })
  @ApiParam({ name: 'id', description: 'Delivery Id', type: Number })
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
    type: DeliveryProduct,
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
    @Param('id', ParseIntPipe) deliveryId: number,
    @Body('productId', ParseIntPipe) productId: number,
    @Body('quantity', ParseIntPipe) quantity: number,
  ) {
    return this.deliveriesService.addDetail(deliveryId, productId, quantity);
  }

  @Patch('details/:detailId')
  @Roles(Role.SuperAdmin, Role.Admin)
  @ApiOperation({
    summary: 'Update a detail of an delivery',
    description:
      'Update a detail of an delivery. If the stock of any product is not enough, the detail will not be updated',
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
    type: DeliveryProduct,
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
    return this.deliveriesService.updateDetail(detailId, quantity);
  }

  @Delete('details/:detailId')
  @Roles(Role.SuperAdmin, Role.Admin)
  @ApiOperation({
    summary: 'Remove a detail of an delivery',
    description: 'Remove a detail of an delivery.',
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
    return this.deliveriesService.removeDetail(detailId);
  }
}
