import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Roles } from '../../core/decorators/roles.decorator';
import { RolesGuard } from '../../core/guards/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Role } from './enums/role.enum';
import { UserService } from './user.service';
import { Request as ExpressRequest } from 'express';
import { validateToken } from 'src/core/utils/jwt';
import { ConfigService } from '@nestjs/config';
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

const RolesUSers = [Role.User, Role.SuperAdmin, Role.Admin];

@ApiTags('user')
@Controller('user')
@UseGuards(RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(Role.SuperAdmin)
  @ApiOperation({ summary: 'Create a new user', description: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiCookieAuth('auth-cookie')
  @ApiResponse({ status: 201, description: 'User created successfully', type: User })
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
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @Roles(Role.SuperAdmin)
  @ApiOperation({
    summary: 'Get all users',
    description: 'Get all users',
  })
  @ApiCookieAuth('auth-cookie')
  @ApiResponse({ status: 200, description: 'Users obtained successfully', type: [User] })
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
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @Roles(...RolesUSers)
  @ApiOperation({
    summary: 'Get user by id',
    description: 'Get user by id',
  })
  @ApiCookieAuth('auth-cookie')
  @ApiParam({ name: 'id', description: 'User Id', type: 'number' })
  @ApiResponse({ status: 200, description: 'User obtained successfully', type: User })
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
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  @Roles(...RolesUSers)
  @ApiOperation({
    summary: 'Update a user by id',
    description: 'Update a user by id',
  })
  @ApiCookieAuth('auth-cookie')
  @ApiParam({ name: 'id', description: 'User Id', type: 'number' })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: User })
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
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: ExpressRequest,
  ) {
    const cookies = req.cookies;
    if (!cookies.jwt) {
      return null;
    }
    const currentUser = validateToken(cookies.jwt as string, new ConfigService()) as Partial<User>;
    if (!currentUser) {
      return null;
    }

    if (currentUser.role === Role.SuperAdmin || currentUser.id === +id) {
      return this.userService.update(+id, updateUserDto);
    }

    return null;
  }

  @Delete(':id')
  @Roles(Role.SuperAdmin)
  @ApiOperation({
    summary: 'Delete a user by id',
    description: 'Delete a user by id',
  })
  @ApiCookieAuth('auth-cookie')
  @ApiParam({ name: 'id', description: 'User Id', type: 'number' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
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
    return this.userService.remove(+id);
  }
}
