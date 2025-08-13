import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  full_name: string;

  @IsString()
  email: string;

  @IsEnum(['user', 'admin', 'superadmin'])
  @IsOptional()
  role?: string;
}
