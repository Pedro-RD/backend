import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(email: string, password: string) {
    const user = await this.usersService.login(email, password);
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };
    return {
      token: await this.jwtService.signAsync(payload),
      user,
    };
  }
}
