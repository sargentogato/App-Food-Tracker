import { Type } from 'class-transformer';
import { IsArray, IsDate, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

class DeliveryProductDto {
  @IsInt()
  product_id: number;

  @IsInt()
  @Min(1, { message: 'Quantity must be greater than 0' })
  quantity: number;
}

export class CreateDeliveryDto {
  @IsString()
  @IsOptional()
  observation?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeliveryProductDto)
  products: DeliveryProductDto[];

  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsInt()
  @Type(() => Number)
  clientId: number;
}
