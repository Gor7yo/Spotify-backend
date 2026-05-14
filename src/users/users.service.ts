import { BadRequestException, Injectable } from '@nestjs/common';
import { UserDTO } from 'src/auth/dto/user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string): Promise<UserDTO | null> {
    const user = this.prisma.user.findFirst({
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

    if (!user) throw new BadRequestException();

    return user;
  }
}
