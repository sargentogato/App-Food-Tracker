import { Type } from 'class-transformer';
import { IsDate, IsInt, IsString } from 'class-validator';

export class CreateProductDto {
  @IsInt()
  @Type(() => Number)
  readonly id_item: number;

  @IsString()
  readonly batch_number: string;

  @IsDate()
  @Type(() => Date)
  readonly expire_date: Date;

  @IsInt()
  @Type(() => Number)
  readonly quantity: number;
}
