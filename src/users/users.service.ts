import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserDTO } from 'src/auth/dto/user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { DeleteUserDTO } from './dto/delete-user.dto';
import * as bcrypt from 'bcrypt';
import { PatchUserDTO } from './dto/patch-user.dto';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async patchData(DTO: PatchUserDTO, userId: string): Promise<UserDTO> {
    const { password, email, username, bio, avatarUrl } = DTO;

    const user = this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        username,
        bio,
        avatarUrl,
        email
      },
    });

    return user;
  }

  async deleteUser(DTO: DeleteUserDTO): Promise<boolean> {
    const { email, password } = DTO;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Неверно указан email или пароль');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверно указан email или пароль');
    }

    await this.prisma.user.delete({
      where: { id: user.id },
    });

    return true;
  }
}
