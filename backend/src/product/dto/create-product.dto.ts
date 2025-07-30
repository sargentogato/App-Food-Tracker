import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'name is required' })
  name: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  quantity: number;

  @IsDate()
  @Type(() => Date)
  expireDate: Date;

  @IsString()
  @IsOptional()
  category: string;

  @IsString()
  @IsOptional()
  provider: string;

  @IsString()
  @IsOptional()
  batchNumber: string;
}
