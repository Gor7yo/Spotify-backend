import { HttpService } from '@nestjs/axios';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { firstValueFrom } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';

@Injectable()
export class LastfmService {
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly baseUrl: string;
  private readonly timeout: number; // 👈 Добавляем поле
  private readonly cacheTtl: number; // 👈 Добавляем поле

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    // ✅ Используем process.env напрямую
    this.apiKey = process.env.LASTFM_API_KEY || '';
    this.apiSecret = process.env.LASTFM_API_SECRET || '';
    this.baseUrl =
      process.env.LASTFM_BASE_URL || 'http://ws.audioscrobbler.com/2.0/';
    this.timeout = parseInt(process.env.LASTFM_TIMEOUT || '5000');
    this.cacheTtl = parseInt(process.env.LASTFM_CACHE_TTL || '3600') * 1000;

    console.log('LastFM Config:', {
      apiKey: this.apiKey ? '****' : 'MISSING',
      baseUrl: this.baseUrl,
      timeout: this.timeout,
      cacheTtl: this.cacheTtl,
    });
  }

  private generateSignature(params: Record<string, string>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}${params[key]}`)
      .join('');

    return crypto
      .createHash('md5')
      .update(sortedParams + this.apiSecret)
      .digest('hex');
  }

  private async makeRequest<T>(
    method: string,
    params: Record<string, any>,
    useCache: boolean = true,
    cacheKey?: string,
  ): Promise<T> {
    const requestParams = {
      method,
      api_key: this.apiKey,
      format: 'json',
      ...params,
    };

    const cacheKeyFinal =
      cacheKey || `lastfm:${method}:${JSON.stringify(params)}`;

    if (useCache) {
      const cached = await this.cacheManager.get<T>(cacheKeyFinal);
      if (cached) {
        return cached;
      }
    }

    try {
      // Используем this.timeout из конструктора
      const response = await firstValueFrom(
        this.httpService.get(this.baseUrl, { params: requestParams }).pipe(
          timeout(this.timeout), // ✅ Теперь всегда число
          retry(3),
          catchError((error) => {
            throw new HttpException(
              error.response?.data?.message || 'LastFM API error',
              error.response?.status || HttpStatus.BAD_GATEWAY,
            );
          }),
        ),
      );

      const data = response.data;

      if (data.error) {
        throw new HttpException(data.message, data.error);
      }

      if (useCache) {
        // Используем this.cacheTtl из конструктора
        await this.cacheManager.set(cacheKeyFinal, data, this.cacheTtl);
      }

      return data;
    } catch (err) {
      throw new HttpException(
        err.message || 'Failed to fetch from LastFM',
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getArtistInfo(artist: string, mbid?: string): Promise<any> {
    const params = mbid ? { mbid } : { artist };
    return this.makeRequest(
      'artist.getInfo',
      params,
      true,
      `artist:${artist || mbid}`,
    );
  }

  async getTopTracks(
    artist: string,
    limit: number = 10,
    page: number = 1,
  ): Promise<any> {
    return this.makeRequest('artist.getTopTracks', {
      artist,
      limit: Math.min(limit, 50),
      page,
    });
  }

  async getSimilarArtists(artist: string, limit: number = 10): Promise<any> {
    return this.makeRequest('artist.getSimilar', {
      artist,
      limit: Math.min(limit, 50),
    });
  }

  async searchArtist(
    artist: string,
    limit: number = 30,
    page: number = 1,
  ): Promise<any> {
    return this.makeRequest('artist.search', {
      artist,
      limit: Math.min(limit, 100),
      page,
    });
  }

  async getAlbumInfo(
    album: string,
    artist: string,
    mbid?: string,
  ): Promise<any> {
    const params = mbid ? { mbid } : { album, artist };
    return this.makeRequest('album.getInfo', params);
  }

  async preloadPopularData(artist: string) {
    const promises = [
      this.getArtistInfo(artist),
      this.getTopTracks(artist),
      this.getSimilarArtists(artist),
    ];
    return Promise.allSettled(promises);
  }

  async getMultipleArtistsInfo(artists: string[]): Promise<any[]> {
    const promises = artists.map((artist) => this.getArtistInfo(artist));
    return Promise.all(promises);
  }

  async invalidateCache(pattern: string): Promise<void> {
    console.log(`Invalidation for pattern ${pattern} would need Redis`);
  }

  async getSessionToken(token: string): Promise<string> {
    const params = {
      method: 'auth.getSession',
      token,
      api_key: this.apiKey,
    };
    const signature = this.generateSignature(params);
    const response = await this.makeRequest<any>('auth.getSession', {
      token,
      api_sig: signature,
    });
    return response.session.key;
  }
}
