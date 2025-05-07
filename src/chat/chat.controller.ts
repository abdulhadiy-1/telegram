import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Request } from 'express';
import { CreateGrDto } from './dto/create-gr.dto';
import { ApiBody } from '@nestjs/swagger';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  create(@Body() createChatDto: CreateChatDto, @Req() req: Request) {
    return this.chatService.create(createChatDto, req);
  }

  @Post('Gr')
  createGr(@Body() createChatDto: CreateGrDto, @Req() req: Request) {
    return this.chatService.createGr(createChatDto, req);
  }

  @Post('join/:chatId')
  join(@Param('chatId') id: string, @Req() req: Request) {
    return this.chatService.joinToGroup(id, req);
  }

  @Get()
  findAll(@Req() req: Request) {
    return this.chatService.findAll(req);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    return this.chatService.findOne(id, req);
  }

  @Patch(':id')
  @ApiBody({ type: Object })
  update(@Param('id') id: string, @Body() updateChatDto: {name?: string}, @Req() req: Request) {
    return this.chatService.update(id, updateChatDto, req);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.chatService.remove(id, req);
  }
}
