import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from './mailer/mailer.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [UserModule, PrismaModule, AuthModule, MailerModule, ChatModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
