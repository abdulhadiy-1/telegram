import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: 'hadiyhadiy2008@gmail.com',
      pass: 'cwli xmko bbdg pezo',
    },
  });

  async sendMail(to: string, subject: string, text: string) {
    const info = await this.transporter.sendMail({
      from: 'hadiyhadiy2008@gmail.com',
      to,
      subject,
      text,
    });

    console.log('Email sent: %s', info.messageId);
    return info;
  }
}
