import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsNotEmpty,
  IsUrl,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string;
  @ApiProperty()
  @IsOptional()
  @IsUrl()
  avatar?: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  phone: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  username: string;
}
