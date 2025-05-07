import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsNotEmpty,
  IsUrl,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
  @ApiProperty()
  @IsOptional()
  @IsUrl()
  avatar?: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string;
}
