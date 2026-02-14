import { IsDate, IsInt, IsString } from 'class-validator';

export class CreateProductDto {
  @IsInt()
  readonly id_item: number;

  @IsString()
  readonly batch_number: string;

  @IsDate()
  readonly expire_date: Date;

  @IsInt()
  readonly quantity: number;
}
