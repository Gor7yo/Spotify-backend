import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { LastfmModule } from './lastfm/lastfm.module';

@Module({
  imports: [AuthModule, PrismaModule, UsersModule, LastfmModule],
})
export class AppModule {}
