import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, SignInResponseDTO } from './dto/main';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginUserDTO } from './dto/login-user.dto';
import { UserDTO } from './dto/user.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async signUp(DTO: CreateUserDto): Promise<SignInResponseDTO> {
    const { username, email, password } = DTO;

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (user)
      throw new ConflictException(
        'Пользователь с такими данными уже существует!',
      );

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const createdUser = await this.prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
      },
    });

    return this.getTokens(createdUser);
  }

  async signIn(DTO: LoginUserDTO): Promise<SignInResponseDTO> {
    const { email, password } = DTO;

    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) throw new UnauthorizedException('Неверные данные');

    const isMatches = await bcrypt.compare(password, user.passwordHash);

    if (!isMatches) throw new UnauthorizedException('Неверные данные');

    return this.getTokens(user);
  }

  async getUserById(id: string): Promise<UserDTO> {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
      },
    });

    if (!user) throw new UnauthorizedException();

    return user;
  }

  private generateSecureToken(): string {
    return randomBytes(48).toString('base64url');
  }

  async getTokens(user: UserDTO): Promise<SignInResponseDTO> {
    const { id, username, email, role } = user;

    const payload = {
      id,
      username,
      email,
      role,
    };

    const refreshToken = {
      token: this.generateSecureToken(),
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    await this.prisma.refreshTokens.deleteMany({
      where: { userId: id },
    });

    const userFor = await this.prisma.user.findFirst({
      where: {
        id,
      },
    });

    if (!userFor) throw new UnauthorizedException('User undefinde');

    const refreshTokenCreated = await this.prisma.refreshTokens.create({
      data: {
        token: refreshToken.token,
        userId: id,
        expires: refreshToken.expires,
      },
    });

    const accesToken = await this.jwt.signAsync(payload);
    return new SignInResponseDTO(accesToken, refreshTokenCreated.token);
  }

  async refreshToken(token: string): Promise<SignInResponseDTO> {
    const now = new Date();
    const refreshToken = await this.prisma.refreshTokens.findFirst({
      where: {
        token,
        expires: { lt: now },
      },
      include: {
        user: true,
      },
    });

    if (!refreshToken) throw new UnauthorizedException('Invalid refresh token');

    return this.getTokens(refreshToken.user);
  }
}
