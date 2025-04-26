import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Res,
  UnauthorizedException,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { UserPayload } from 'types/auth/auth.services';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(body.email, body.password);
    const token = await this.authService.login(user);
    res.cookie('token', token.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 5,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    });

    res.cookie('refresh_token', token.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 วัน
      path: '/auth/refresh',
      secure: process.env.NODE_ENV === 'production',
    });
    return { message: 'Login success' };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refresh_token'];
    console.log('🔁 Refresh token: ', refreshToken);
    console.log('🧠 Payload from token: ', req.cookies['token']);
    console.log('✅ New access token issued');
    if (!refreshToken) throw new UnauthorizedException('No refresh token');

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('JWT_SECRET'),
      });

      const newAccessToken = this.jwtService.sign(
        {
          id: payload.id,
          email: payload.email,
          role: payload.role,
        },
        {
          secret: this.configService.get('JWT_SECRET'),
          expiresIn: '5m',
        },
      );

      // ส่ง access token ใหม่กลับไปใน cookie
      res.cookie('token', newAccessToken, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 5,
        secure: process.env.NODE_ENV === 'production',
      });

      return { message: 'Access token refreshed' };
    } catch (err) {
      console.error('Refresh token error:', err.message);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @Get('status')
  async getStatus(@Req() req: Request) {
    const token = req.cookies['token'];
    if (!token) return { user: null };

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      return {
        user: {
          id: payload.id,
          email: payload.email,
          role: payload.role,
        },
      };
    } catch {
      return { user: null }; //  token หมดอายุ ก็ไม่ error
    }
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: Request & { user: UserPayload }) {
    return req.user;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    res.clearCookie('refresh_token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/auth/refresh', // ต้องระบุ path ให้ตรงกับที่ตั้งไว้
    });

    return { message: 'Logged out successfully' };
  }
}
