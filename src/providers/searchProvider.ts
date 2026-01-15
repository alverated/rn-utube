// Search provider interface - abstraction for different search implementations

export interface VideoSearchResult {
  videoId: string;
  title: string;
  channelName: string;
  thumbnailUrl: string;
  duration?: string;
  views?: string;
  publishedAt?: string;
}

export interface VideoDetail extends VideoSearchResult {
  description?: string;
  channelId?: string;
}

export interface SearchProvider {
  /**
   * Search for videos by query
   */
  searchVideos(query: string, limit?: number): Promise<VideoSearchResult[]>;

  /**
   * Get detailed information about a specific video
   */
  getVideoDetails(videoId: string): Promise<VideoDetail | null>;
}
