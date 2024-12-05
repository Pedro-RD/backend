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
                    filename: (_req, file, cb) => {
                        const filename = `${Date.now()}-${file.originalname}`;
                        cb(null, filename);
                    },
                }),
                fileFilter: (_req, file, cb) => {
                    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
                        return cb(new Error('Only .jpg, .jpeg, and .png files are allowed!'), false);
                    }
                    cb(null, true);
                },
                limits: {
                    fileSize: 1 * 1024 * 1024, // 1 MB
                },
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
