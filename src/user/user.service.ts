import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private client: PrismaService){}
  async findAll() {
    let users = await this.client.user.findMany({omit: {password: true}})
    return users
  }

  async findOne(id: string) {
    let user = await this.client.user.findUnique({where: {id}})
    if(!user) throw new NotFoundException("user not found")
    return user
  }

  async remove(phone: string) {
    let user = await this.client.user.findUnique({where: {phone}})
    if(!user) throw new NotFoundException("user not found")
    let deleted = await this.client.user.delete({where: {phone}})
    return deleted
  }
}
