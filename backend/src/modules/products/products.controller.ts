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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetUser } from 'src/core/decorators/get-user.decorator';
import { FilterQueryProductsDto } from './dto/filter-query-products.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { Roles } from 'src/core/decorators/roles.decorator';
import { Role } from '../user/enums/role.enum';
import { Product } from './entities/product.entity';

@ApiTags('Products')
@Controller('products')
@UseGuards(RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(Role.SuperAdmin, Role.Admin)
  @ApiOperation({ summary: 'Create a new product', description: 'Create a new product' })
  @ApiBody({ type: CreateProductDto })
  @ApiCookieAuth('auth-cookie')
  @ApiResponse({
    status: 201,
    description: 'The product has been successfully created.',
    type: Product,
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    schema: {
      example: {
        statusCode: 400,
        message: 'Bad request',
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
    description: 'Internal server error',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: 'Internal Server Error',
      },
    },
  })
  create(@Body() createProductDto: CreateProductDto, @GetUser('id') userId: number) {
    return this.productsService.create(createProductDto, userId);
  }

  @Get('get/all')
  @ApiOperation({ summary: 'Get all products', description: 'Get all products' })
  @ApiResponse({
    status: 200,
    description: 'Get all products',
    type: [Product],
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: 'Internal Server Error',
      },
    },
  })
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by id', description: 'Get product by id' })
  @ApiParam({ name: 'id', description: 'Product id', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Get product by id',
    type: Product,
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Product not found',
        error: 'Not Found',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: 'Internal Server Error',
      },
    },
  })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Get('')
  @ApiOperation({
    summary: 'Get paginated and filtered products',
    description: 'Get paginated and filtered products',
  })
  @ApiQuery({
    type: FilterQueryProductsDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Get paginated and filtered products',
    schema: {
      example: {
        data: [Product],
        meta: {
          total: 0,
          offset: 0,
          limit: 10,
          nextOffset: null,
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    schema: {
      example: {
        statusCode: 400,
        message: 'Bad request',
        error: 'Bad Request',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: 'Internal Server Error',
      },
    },
  })
  filter(@Query() filterQueryProductsDto: FilterQueryProductsDto) {
    return this.productsService.filter(filterQueryProductsDto);
  }

  @Patch(':id')
  @Roles(Role.SuperAdmin, Role.Admin)
  @ApiOperation({ summary: 'Update a product', description: 'Update a product' })
  @ApiParam({ name: 'id', description: 'Product id', type: 'number' })
  @ApiBody({ type: UpdateProductDto })
  @ApiCookieAuth('auth-cookie')
  @ApiResponse({
    status: 200,
    description: 'Update a product',
    type: Product,
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    schema: {
      example: {
        statusCode: 400,
        message: 'Bad request',
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
    description: 'Product not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Product not found',
        error: 'Not Found',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: 'Internal Server Error',
      },
    },
  })
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @GetUser('id') userId: number,
  ) {
    return this.productsService.update(+id, updateProductDto, userId);
  }

  @Delete(':id')
  @Roles(Role.SuperAdmin, Role.Admin)
  @ApiOperation({ summary: 'Delete a product', description: 'Delete a product' })
  @ApiParam({ name: 'id', description: 'Product id', type: 'number' })
  @ApiCookieAuth('auth-cookie')
  @ApiResponse({ status: 200, description: 'Delete a product' })
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
    description: 'Product not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Product not found',
        error: 'Not Found',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: 'Internal Server Error',
      },
    },
  })
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
