import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resident } from '../residents/entities/resident.entity';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    controllers: [UsersController],
    providers: [UsersService],
    imports: [TypeOrmModule.forFeature([User, Resident]), forwardRef(() => AuthModule)],
    exports: [UsersService],
})
export class UsersModule {}
