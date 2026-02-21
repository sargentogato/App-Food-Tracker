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
} from '@nestjs/common';
import { EntriesService } from './entries.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { Role } from '../user/enums/role.enum';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { Roles } from 'src/core/decorators/roles.decorator';
import { GetUser } from 'src/core/decorators/get-user.decorator';

@Controller('entries')
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.SuperAdmin, Role.Admin)
  create(@Body() createEntryDto: CreateEntryDto, @GetUser('id') userId: number) {
    return this.entriesService.create(createEntryDto, userId);
  }

  @Get('')
  findAll() {
    return this.entriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.entriesService.findOne(id);
  }
  @Patch(':id')
  updateHeader(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEntryDto: UpdateEntryDto,
    @GetUser('id') userId: number,
  ) {
    return this.entriesService.updateHeader(id, updateEntryDto, userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.entriesService.remove(id);
  }

  // --- MÉTODOS DE LOS DETALLES (ENTRY PRODUCTS) ---

  @Post(':id/details')
  addDetail(
    @Param('id', ParseIntPipe) entryId: number,
    @Body('productId', ParseIntPipe) productId: number,
    @Body('quantity', ParseIntPipe) quantity: number,
  ) {
    return this.entriesService.addDetail(entryId, productId, quantity);
  }

  @Patch('details/:detailId')
  updateDetail(
    @Param('detailId', ParseIntPipe) detailId: number,
    @Body('quantity', ParseIntPipe) quantity: number,
  ) {
    return this.entriesService.updateDetail(detailId, quantity);
  }

  @Delete('details/:detailId')
  removeDetail(@Param('detailId', ParseIntPipe) detailId: number) {
    return this.entriesService.removeDetail(detailId);
  }
}
