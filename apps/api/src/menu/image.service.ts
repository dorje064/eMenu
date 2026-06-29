import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ImageResultDto } from './dto/image-result.dto';

/** Shape of the bits of an Unsplash photo we consume (partial). */
interface UnsplashPhoto {
  id: string;
  alt_description: string | null;
  description: string | null;
  urls: { thumb?: string; small?: string; regular?: string; full?: string };
  user: { name?: string };
  links: { html?: string };
}

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);

  constructor(private readonly config: ConfigService) {}

  /** Search stock photos for `query` and map them to the picker's result shape. */
  async search(query: string): Promise<ImageResultDto[]> {
    if (!query) return [];

    const key = this.config.get<string>('UNSPLASH_ACCESS_KEY');
    if (!key) {
      throw new ServiceUnavailableException(
        'Image search is not configured. Set UNSPLASH_ACCESS_KEY in the API environment.'
      );
    }

    try {
      const { data } = await axios.get<{ results: UnsplashPhoto[] }>(
        'https://api.unsplash.com/search/photos',
        {
          params: { query, per_page: 24, content_filter: 'high' },
          headers: { Authorization: `Client-ID ${key}` },
          timeout: 8000,
        }
      );

      return (data.results ?? []).map((p): ImageResultDto => ({
        id: p.id,
        thumbUrl: p.urls.thumb ?? p.urls.small ?? '',
        fullUrl: p.urls.regular ?? p.urls.full ?? '',
        alt: p.alt_description ?? p.description ?? null,
        credit: p.user?.name ?? 'Unsplash',
        sourceUrl: p.links?.html ?? 'https://unsplash.com',
      }));
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        throw new ServiceUnavailableException(
          'Image search key was rejected by Unsplash (401). Check UNSPLASH_ACCESS_KEY.'
        );
      }
      this.logger.error(
        `Unsplash search failed: ${err instanceof Error ? err.message : String(err)}`
      );
      throw new ServiceUnavailableException(
        'Image search is temporarily unavailable. Please try again.'
      );
    }
  }
}
