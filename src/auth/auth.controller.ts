import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, SignInResponseDTO } from './dto/main';
import { LoginUserDTO } from './dto/login-user.dto';
import { UserDTO } from './dto/user.dto';
import { AuthGuard } from '../guards/auth.guard';
import { RefreshTokenDTO } from './dto/refresh-token.dto';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  async signUp(@Body() dto: CreateUserDto, @Res() res: Response) {
    const result = await this.authService.signUp(dto);
    return this.setRefreshTokenCookie(res, result.refreshToken).json({
      accessToken: result.accesToken,
    });
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() dto: LoginUserDTO, @Res() res: Response) {
    const result = await this.authService.signIn(dto);
    return this.setRefreshTokenCookie(res, result.refreshToken).json({
      accessToken: result.accesToken,
    });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = this.extractRefreshTokenFromCookie(req);
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const result = await this.authService.refreshToken(refreshToken);
    return this.setRefreshTokenCookie(res, result.refreshToken).json({
      accessToken: result.accesToken,
    });
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken = this.extractRefreshTokenFromCookie(req);
    if (refreshToken) {
      await this.authService.revokeRefreshToken(refreshToken);
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return res.json({ message: 'Logged out seccessfully' });
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getMe(@Req() req): Promise<UserDTO> {
    const user = this.authService.getUserById(req.user?.id);
    return user;
  }

  private setRefreshTokenCookie(res: Response, token: string): Response {
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 25 * 60 * 60 * 1000,
      path: '/',
    });

    return res;
  }

  private extractRefreshTokenFromCookie(req: Request): string | null {
    return req.cookies?.refreshToken || null;
  }
}
