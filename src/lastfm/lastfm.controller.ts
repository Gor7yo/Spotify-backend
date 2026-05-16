import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { LastfmService } from './lastfm.service';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('lastfm')
@UseGuards(AuthGuard)
export class LastfmController {
  constructor(private readonly lastfmService: LastfmService) {}

  // Тест 1: Получить инфо об артисте
  @Get('artist/:name')
  async getArtist(@Param('name') name: string) {
    return this.lastfmService.getArtistInfo(name);
  }

  // Тест 2: Поиск артистов
  @Get('search')
  async search(@Query('q') query: string) {
    return this.lastfmService.searchArtist(query);
  }

  // Тест 3: Топ треки
  @Get('artist/:name/tracks')
  async getTracks(@Param('name') name: string, @Query('limit') limit?: number) {
    return this.lastfmService.getTopTracks(name, limit);
  }

  // Тест 4: Предзагрузка данных
  @Get('preload/:artist')
  async preload(@Param('artist') artist: string) {
    await this.lastfmService.preloadPopularData(artist);
    return { message: `Preloading started for ${artist}` };
  }
}
