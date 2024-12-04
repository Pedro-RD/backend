import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resident } from '../residents/entities/resident.entity';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Module({
    imports: [
        MulterModule.registerAsync({
            useFactory: () => ({
                storage: diskStorage({
                    destination: './public/uploads/users',
                    filename: (req, file, cb) => {
                        const filename = `${Date.now()}-${file.originalname}`;
                        cb(null, filename);
                    },
                }),
            }),
        }),
        TypeOrmModule.forFeature([User, Resident]),
        forwardRef(() => AuthModule),
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {}
