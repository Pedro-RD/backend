import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { User } from '../users/entities/user.entity';
import { Resident } from './entities/resident.entity';
import { ResidentsController } from './residents.controller';
import { ResidentsService } from './residents.service';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Resident, User]),
        ConfigModule,
        UsersModule,
        AuthModule,
        MulterModule.registerAsync({
            useFactory: () => ({
                storage: diskStorage({
                    destination: './public/uploads/residents',
                    filename: (req, file, cb) => {
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
    ],
    controllers: [ResidentsController],
    providers: [ResidentsService],
    exports: [ResidentsService],
})
export class ResidentsModule {}
