import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-auth.dto';
import { Request } from 'express';
import { UpdateUserDto } from './dto/update-auth.dto';
import { AuthGuard } from 'src/auth-middleware/auth-middleware.guard';
import { ApiBody } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createAuthDto: CreateUserDto) {
    return this.authService.register(createAuthDto);
  }

  @Post('sendOtp')
  sendOtp(@Body() data: { email: string }) {
    return this.authService.sendOtp(data);
  }

  @Post('verify')
  @ApiBody({ type: Object })
  verify(@Body() data: { email: string; otp: string }) {
    return this.authService.verifyOtp(data);
  }

  @Post('login')
  @ApiBody({ type: Object })
  login(
    @Body() data: { email: string; password: string },
    @Req() req: Request,
  ) {
    return this.authService.login(data, req);
  }

  @UseGuards(AuthGuard)
  @Post('update')
  update(@Body() data: UpdateUserDto, @Req() req: Request) {
    return this.authService.update(data, req);
  }

  @UseGuards(AuthGuard)
  @Post('changePassword')
  @ApiBody({ type: Object })
  changePassword(
    @Body() data: { oldPass: string; newPass: string },
    @Req() req: Request,
  ) {
    return this.authService.changePassword(data, req);
  }
}
