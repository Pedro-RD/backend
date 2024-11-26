import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Resident } from '../residents/entities/resident.entity';
import { UsersModule } from '../users/users.module';
import { Message } from './entities/message.entity';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';

@Module({
    imports: [UsersModule, TypeOrmModule.forFeature([Message, Resident]), AuthModule],
    controllers: [MessagesController],
    providers: [MessagesService],
})
export class MessagesModule {}
