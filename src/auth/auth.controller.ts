import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/main';
import { LoginUserDTO } from './dto/login-user.dto';
import { UserDTO } from './dto/user.dto';
import { AuthGuard } from '../guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  signUp(@Body() dto: CreateUserDto) {
    return this.authService.signUp(dto);
  }

  @Post('sign-in')
  signIn(@Body() dto: LoginUserDTO) {
    return this.authService.signIn(dto);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getMe(@Request() req): Promise<UserDTO> {
    const user = this.authService.getUserById(req.user?.id);
    return user;
  }
}
