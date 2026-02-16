import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class FilterQueryProductsDto {
  @IsString()
  @IsOptional()
  item_name?: string;

  @IsString()
  @IsOptional()
  batch_number?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  expire_date?: Date;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}
