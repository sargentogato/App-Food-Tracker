import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, Min } from 'class-validator';

export class FilterQueryDeliveryDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateStart?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateEnd?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  clientId?: number;

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
