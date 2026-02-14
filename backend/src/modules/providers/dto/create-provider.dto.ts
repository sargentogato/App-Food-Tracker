import { IsEmail, IsString } from 'class-validator';

export class CreateProviderDto {
  @IsString()
  name: string;

  @IsString()
  contactName: string;

  @IsString()
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  address: string;
}
