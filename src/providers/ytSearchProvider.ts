// YouTube search using custom API endpoint

import { SearchProvider, VideoSearchResult, VideoDetail } from './searchProvider';
import { getThumbnailUrl } from '../utils/youtube';

const API_ENDPOINT = process.env.EXPO_PUBLIC_API_ENDPOINT || 'https://utube-free.vercel.app/api';
const API_KEY = process.env.EXPO_PUBLIC_API_KEY || 'alverated';

interface ApiVideoItem {
  id: string;
  title: string;
  thumbnails: Array<{ url: string; width: number; height: number }>;
  channel: {
    id: string;
    name: string;
    thumbnails: Array<{ url: string; width: number; height: number }>;
  };
  duration: string;
  viewCount: string;
  publishedTimeText: string;
  isLive: boolean;
}

interface ApiResponse {
  success: boolean;
  data: {
    videos: {
      total: number;
      items: ApiVideoItem[];
    };
  };
}

export class YtSearchProvider implements SearchProvider {
  async searchVideos(query: string, limit: number = 20): Promise<VideoSearchResult[]> {
    try {
      console.log(`Searching YouTube API for: "${query}"`);

      const encodedQuery = encodeURIComponent(query);
      const url = `${API_ENDPOINT}/search?q=${encodedQuery}&type=videos`;

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const result: ApiResponse = await response.json();

      if (!result.success || !result.data?.videos?.items) {
        console.error('Invalid API response format');
        return [];
      }

      const videos = result.data.videos.items.slice(0, limit);

      console.log(`✓ Found ${videos.length} videos`);

      return videos.map((video) => {
        // Select best quality thumbnail from API
        let thumbnailUrl = '';

        if (video.thumbnails && video.thumbnails.length > 0) {
          // Filter out invalid thumbnails and sort by width
          const validThumbnails = video.thumbnails.filter(t => t && t.url && t.width);
          if (validThumbnails.length > 0) {
            const bestThumbnail = validThumbnails.sort((a, b) => b.width - a.width)[0];
            thumbnailUrl = bestThumbnail.url;

            // Fix thumbnail URL - ensure it has protocol
            if (thumbnailUrl.startsWith('//')) {
              thumbnailUrl = 'https:' + thumbnailUrl;
            }
          }
        }

        // Fallback to YouTube's direct thumbnail URL if API doesn't provide one
        if (!thumbnailUrl) {
          thumbnailUrl = getThumbnailUrl(video.id, 'hq');
        }

        return {
          videoId: video.id,
          title: video.title,
          channelName: video.channel.name,
          thumbnailUrl: thumbnailUrl,
          duration: video.duration || undefined,
          views: video.viewCount || undefined,
          publishedAt: video.publishedTimeText || undefined,
        };
      });
    } catch (error) {
      console.error('Error searching videos:', error);
      return [];
    }
  }

  async getVideoDetails(videoId: string): Promise<VideoDetail | null> {
    try {
      // For now, return basic details using the video ID
      // You can implement a specific endpoint for video details if available
      return {
        videoId,
        title: 'Video',
        channelName: 'Unknown',
        thumbnailUrl: getThumbnailUrl(videoId, 'hq'),
      };
    } catch (error) {
      console.error('Error getting video details:', error);
      return null;
    }
  }
}

// Export singleton instance
export const ytSearchProvider = new YtSearchProvider();
