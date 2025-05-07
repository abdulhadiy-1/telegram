import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mailer/mailer.service';
import * as bcrypt from 'bcrypt';
import { totp } from 'otplib';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UpdateUserDto } from './dto/update-auth.dto';
totp.options = { digits: 5, step: 300 };
@Injectable()
export class AuthService {
  constructor(
    private client: PrismaService,
    private emailService: MailService,
    private jwt: JwtService,
  ) {}
  async register(createAuthDto: CreateUserDto) {
    let existingEmail = await this.client.user.findUnique({
      where: { email: createAuthDto.email },
    });
    if (existingEmail)
      throw new BadRequestException('User with this email already exists');

    let user = await this.client.user.findUnique({
      where: { phone: createAuthDto.phone },
    });
    if (user)
      throw new BadRequestException(
        'user with this phone number alredy exists',
      );
    let hash = bcrypt.hashSync(createAuthDto.password, 10);
    let newUser = await this.client.user.create({
      data: { ...createAuthDto, password: hash },
    });
    return newUser;
  }

  async sendOtp(data: { email: string }) {
    let otp = totp.generate(data.email);
    try {
      await this.emailService.sendMail(
        data.email,
        'one time password',
        `your otp is ${otp}`,
      );
    } catch (error) {
      console.log('Error sending email:', error);
      throw new BadRequestException('Failed to send OTP email');
    }
    return { message: 'otp sent to email' };
  }

  async verifyOtp(data: { email: string; otp: string }) {
    try {
      let email = data.email;
      let otp = data.otp;
      const match = totp.verify({ token: otp, secret: email });
      if (!match) {
        console.log('Wrong OTP');
        throw new BadRequestException('Wrong OTP');
      }
      const user = await this.client.user.findUnique({ where: { email } });
      if (!user) {
        throw new BadRequestException('User not found');
      }
      await this.client.user.update({
        where: { email },
        data: { status: 'ACTIVE' },
      });
      return { message: 'otp verified' };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('wrong OTP');
    }
  }

  async login(data: { email: string; password: string }, req: Request) {
    let user = await this.client.user.findUnique({
      where: { email: data.email },
    });
    if (!user) throw new BadRequestException('User not found');
    if (user.status !== 'ACTIVE' || !user.emailVerified) {
      throw new BadRequestException('Please verify your email');
    }

    let match = bcrypt.compareSync(data.password, user.password);
    if (!match) {
      throw new BadRequestException('wrong password');
    }
    let session = await this.client.session.findFirst({
      where: {
        ip: req.ip,
        userId: user.id,
      },
    });
    if (!session) {
      await this.client.session.create({
        data: {
          ip: req.ip || '::1',
          data: req.headers['user-agent'] || 'Unknown',
          userId: user.id,
        },
      });
    }
    let accessToken = this.jwt.sign({ id: user.id, role: user.role });
    let refreshToken = this.jwt.sign(
      { id: user.id },
      { secret: 'REFRESH_TOKEN_SECRET', expiresIn: '7d' },
    );
    return { refreshToken, accessToken };
  }

  async update(data: UpdateUserDto, req: Request) {
    if (data.phone) {
      let match = await this.client.user.findUnique({
        where: { phone: data.phone },
      });
      if (match)
        throw new BadRequestException('user with this phone alredy exists');
    }
    if (data.username) {
      let match = await this.client.user.findUnique({
        where: { username: data.username },
      });
      if (match)
        throw new BadRequestException('user with this username alredy exists');
    }
    let updated = await this.client.user.update({
      where: { id: req['user'] },
      data,
    });
    return updated;
  }

  async changePassword(
    data: { oldPass: string; newPass: string },
    req: Request,
  ) {
    let user = await this.client.user.findUnique({
      where: { id: req['user'] },
    });
    if (!user) throw new BadRequestException('User not found');
    let match = bcrypt.compareSync(data.oldPass, user.password);
    if (!match) throw new BadRequestException('wrong password');
    let hash = bcrypt.hashSync(data.newPass, 10);
    let updated = await this.client.user.update({
      where: { id: req['user'] },
      data: { password: hash },
    });
    return updated;
  }
}
