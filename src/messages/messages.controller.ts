import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserReq } from '../auth/user.decorator';
import { Role } from '../enums/roles.enum';
import { User } from '../users/entities/user.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { QueryParamsMessagesDto } from './dto/query-params-messages.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessagesService } from './messages.service';

@Controller('residents/:residentId/messages')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) {}

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Relative, Role.Caretaker)
    @Post()
    create(@Param('residentId', ParseIntPipe) residentId, @Body() createMessageDto: CreateMessageDto, @UserReq() user: User) {
        return this.messagesService.create(residentId, user, createMessageDto);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Relative, Role.Caretaker)
    @Get()
    findAll(@Param('residentId', ParseIntPipe) residentId, @UserReq() user: User, @Query() queryParams: QueryParamsMessagesDto) {
        return this.messagesService.findAll(residentId, user, queryParams);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Relative, Role.Caretaker)
    @Get(':id')
    findOne(@Param('residentId', ParseIntPipe) residentId, @Param('id', ParseIntPipe) id: number, @UserReq() user: User) {
        return this.messagesService.findOne(residentId, user, id);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Relative, Role.Caretaker)
    @Patch(':id')
    update(
        @Param('residentId', ParseIntPipe) residentId,
        @Param('id', ParseIntPipe) id: number,
        @Body() updateMessageDto: UpdateMessageDto,
        @UserReq() user: User,
    ) {
        return this.messagesService.update(residentId, user, id, updateMessageDto);
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Relative, Role.Caretaker)
    @Delete(':id')
    remove(@Param('residentId', ParseIntPipe) residentId, @Param('id', ParseIntPipe) id: number, @UserReq() user: User) {
        return this.messagesService.remove(residentId, user, id);
    }
}
