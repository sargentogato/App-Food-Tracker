import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateProviderDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  contactName: string;

  @IsString()
  @IsOptional()
  phone: string;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  address: string;
}
