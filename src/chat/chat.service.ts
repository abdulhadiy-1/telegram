import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Request } from 'express';
import { CreateGrDto } from './dto/create-gr.dto';

@Injectable()
export class ChatService {
  constructor(private client: PrismaService) {}
  async create(createChatDto: CreateChatDto, req: Request) {
    const user1Id = req['user'];
    const user2Id = createChatDto.userId;

    const existingChat = await this.client.chat.findFirst({
      where: {
        isGroup: false,
        users: {
          every: {
            OR: [{ userId: user1Id }, { userId: user2Id }],
          },
        },
      },
      include: {
        users: true,
      },
    });

    if (existingChat && existingChat.users.length === 2) {
      return existingChat;
    }

    const newChat = await this.client.chat.create({
      data: {
        isGroup: false,
        users: {
          create: [
            { user: { connect: { id: user1Id } } },
            { user: { connect: { id: user2Id } } },
          ],
        },
      },
      include: {
        users: true,
      },
    });

    return newChat;
  }
  async createGr(createGrDto: CreateGrDto, req: Request) {
    const user1Id = req['user'];
    const user2Id = createGrDto.userId;
  
    const existingChat = await this.client.chat.findFirst({
      where: {
        isGroup: true,
        users: {
          every: {
            userId: {
              in: [user1Id, user2Id],
            },
          },
        },
      },
      include: {
        users: true,
      },
    });
  
    if (existingChat) {
      return existingChat;
    }
  
    const newChat = await this.client.chat.create({
      data: {
        isGroup: true,
        name: createGrDto.name,
        users: {
          create: [
            { user: { connect: { id: user1Id } } },
            { user: { connect: { id: user2Id } } },
          ],
        },
      },
      include: {
        users: true,
      },
    });
  
    return newChat;
  }
  

  async findAll(req: Request) {
    const userId = req['user'];
  
    const chats = await this.client.chat.findMany({
      where: {
        users: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1, 
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  
    return chats;
  }
  

  async findOne(id: string, req: Request) {
    const userId = req['user'];
  
    const chat = await this.client.chat.findUnique({
      where: { id },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
  
    const isMember = chat.users.some(u => u.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('Access denied to this chat');
    }
  
    return chat;
  }
  

  async update(id: string, data: { name?: string }, req: Request) {
    const userId = req['user'];
    const chat = await this.client.chat.findUnique({
      where: { id },
      include: {
        users: true,
      },
    });
  
    if (!chat) throw new NotFoundException('Chat not found');
  
    const isMember = chat.users.some(u => u.userId === userId);
    if (!isMember) throw new ForbiddenException('Access denied');
  
    if (!chat.isGroup && data.name) {
      throw new BadRequestException('Cannot rename direct chat');
    }
  
    const updated = await this.client.chat.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  
    return updated;
  }
  

  async remove(id: string, req: Request) {
    const userId = req['user'];
    const chat = await this.client.chat.findUnique({
      where: { id },
      include: {
        users: true,
      },
    });
  
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
  
    const isMember = chat.users.some(u => u.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this chat');
    }
  
    await this.client.chat.delete({
      where: { id },
    });
  
    return { message: `Chat #${id} successfully removed` };
  }
  
  async joinToGroup(chatId: string, req: Request) {
    const userId = req['user'];
  
    const chat = await this.client.chat.findUnique({
      where: { id: chatId },
      include: { users: true },
    });
  
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
  
    if (!chat.isGroup) {
      throw new BadRequestException('This is not a group chat');
    }
    const isUserAlreadyInChat = chat.users.some(u => u.userId === userId);
    if (isUserAlreadyInChat) {
      throw new BadRequestException('User is already a member of this group');
    }
  
    await this.client.chatUser.create({
      data: {
        chatId,
        userId,
      },
    });
  
    return { message: 'You have successfully joined the group chat' };
  }
  
}
