import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { Role } from '../enums/roles.enum';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './roles.decorator';
import { UserReq } from './user.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @HttpCode(HttpStatus.OK)
    @Post('login')
    signIn(@Body() signInDto: LoginDto) {
        if (signInDto.email) signInDto.email = signInDto.email.toLowerCase();
        return this.authService.signIn(signInDto.email, signInDto.password);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Relative, Role.Caretaker)
    @Get('profile')
    getProfile(@UserReq() user: User) {
        return plainToClass(User, user);
    }
}
