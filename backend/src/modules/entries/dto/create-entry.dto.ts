import { IsArray, IsDate, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class EntryProductDto {
  @IsInt()
  productId: number;

  @IsInt()
  @Min(1, { message: 'Quantity must be greater than 0' })
  quantity: number;
}

export class CreateEntryDto {
  @IsString()
  @IsOptional()
  observation?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EntryProductDto)
  products: EntryProductDto[];

  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsInt()
  @Type(() => Number)
  providerId: number;
}
