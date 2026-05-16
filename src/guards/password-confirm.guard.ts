import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PasswordConfirmGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const password = request.body?.password;
    const email = request.user?.email;

    if (!password) throw new BadRequestException('Введите пароль');

    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) throw new UnauthorizedException('Неверные данные');

    const isMatches = await bcrypt.compare(password, user.passwordHash);

    if (!isMatches) throw new UnauthorizedException('Неверные данные');

    return true;
  }
}
