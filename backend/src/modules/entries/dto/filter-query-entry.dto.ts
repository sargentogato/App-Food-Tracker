import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, Min } from 'class-validator';

export class FilterQueryEntryDto {
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
  providerId?: number;

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
