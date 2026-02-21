import { Type } from 'class-transformer';
import { IsArray, IsDate, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

class DeliveryProductDTO {
  @IsInt()
  product_id: number;

  @IsInt()
  @Min(1, { message: 'Quantity must be greater than 0' })
  quantity: number;
}

export class CreateDeliveryDTO {
  @IsString()
  @IsOptional()
  observation?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeliveryProductDTO)
  products?: DeliveryProductDTO[];

  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsInt()
  clientId: number;
}
