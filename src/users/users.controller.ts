import {
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { ResetPasswordDTO } from './dto/password-reset.dto';
import { QueryParamsUsersDto } from './dto/query-params-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../enums/roles.enum';
import { Roles } from '../auth/roles.decorator';
import { UserReq } from '../auth/user.decorator';
import { User } from './entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationPipe } from './file-validation.pipe';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager)
    @Get()
    findAll(@Query() query: QueryParamsUsersDto) {
        return this.usersService.findAll({
            page: query.page || 1,
            limit: query.limit || 10,
            orderBy: query.orderBy || 'id',
            order: query.order || 'ASC',
            search: query.search || '',
            role: query.role,
        });
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Relative, Role.Caretaker)
    @Post(':id/upload')
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(@Param('id', ParseIntPipe) id, @UploadedFile(new FileValidationPipe()) file: Express.Multer.File, @UserReq() userReq: User) {
        if (userReq.role !== Role.Manager && userReq.id !== id) {
            throw new ForbiddenException('Não tem permissão para aceder a este recurso');
        }
        return this.usersService.addProfilePicture(id, file);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Relative, Role.Caretaker)
    @Delete(':id/upload')
    @HttpCode(HttpStatus.NO_CONTENT)
    removeFile(@Param('id', ParseIntPipe) id, @UserReq() userReq: User) {
        if (userReq.role !== Role.Manager && userReq.id !== id) {
            throw new ForbiddenException('Não tem permissão para aceder a este recurso');
        }
        return this.usersService.clearProfilePicture(id);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Relative, Role.Caretaker)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number, @UserReq() userReq: User) {
        if (userReq.role !== Role.Manager && userReq.id !== id) {
            throw new ForbiddenException('Não tem permissão para aceder a este recurso');
        }
        return this.usersService.findOne(id);
    }

    // @UseGuards(AuthGuard, RolesGuard)
    // @Roles(Role.Manager)
    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        createUserDto.email = createUserDto.email.toLowerCase();
        return this.usersService.create(createUserDto);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Relative, Role.Caretaker)
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto, @UserReq() userReq: User) {
        if (userReq.role !== Role.Manager && userReq.id !== id) {
            throw new ForbiddenException('Não tem permissão para aceder a este recurso');
        }
        if (updateUserDto.email) updateUserDto.email = updateUserDto.email.toLowerCase();
        return this.usersService.update(id, updateUserDto);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Relative, Role.Caretaker)
    @Patch(':id/password')
    @HttpCode(HttpStatus.NO_CONTENT)
    resetPassword(@Param('id', ParseIntPipe) id: number, @Body() resetPasswordDto: ResetPasswordDTO, @UserReq() userReq: User) {
        if (userReq.role !== Role.Manager && userReq.id !== id) throw new ForbiddenException('Não tem permissão para aceder a este recurso');
        return this.usersService.resetPassword(id, resetPasswordDto);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.remove(id);
    }
}
