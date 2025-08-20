import { IsEnum, IsOptional, IsString, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  full_name: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsEnum(['user', 'admin', 'superadmin'])
  @IsOptional()
  role?: string;
}
