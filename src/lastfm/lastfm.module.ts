// lastfm.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config'; // 👈 Добавляем ConfigModule
import { LastfmService } from './lastfm.service';
import { LastfmController } from './lastfm.controller';

@Module({
  imports: [
    // 👇 ВАЖНО: импортируем ConfigModule, чтобы ConfigService был доступен
    ConfigModule.forRoot({
      isGlobal: true, // Делаем глобальным, чтобы не импортировать везде
    }),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get<number>('LASTFM_TIMEOUT', 5000),
        maxRedirects: 5,
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      isGlobal: true,
      useFactory: async (configService: ConfigService) => ({
        ttl: configService.get<number>('LASTFM_CACHE_TTL', 3600) * 1000,
        max: 100,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [LastfmController],
  providers: [LastfmService],
  exports: [LastfmService],
})
export class LastfmModule {}
