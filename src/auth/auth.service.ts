import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.hashed_password))) {
      const { hashed_password, ...result } = user;
      return result;
    }
    throw new UnauthorizedException('Invalid email or password');
  }

  async login(user: any) {
    const payload = { email: user.email, id: user.id, role: user.role_id };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '5m', // อายุ token
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken }; // ✅ return object
  }
}
