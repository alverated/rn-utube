// Storage types for local data model

export interface Playlist {
  id: string;
  name: string;
  videoIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface VideoRef {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  channelName?: string;
  duration?: string;
  views?: string;
  addedAt: string;
  lastPlayedAt?: string;
}

export interface HistoryItem {
  videoId: string;
  playedAt: string;
}

export type Favorites = string[]; // videoIds
export type WatchLater = string[]; // videoIds
export type SearchHistory = string[]; // search keywords

// Storage keys
export const STORAGE_KEYS = {
  PLAYLISTS: '@rn_utube_playlists',
  FAVORITES: '@rn_utube_favorites',
  WATCH_LATER: '@rn_utube_watch_later',
  HISTORY: '@rn_utube_history',
  VIDEOS: '@rn_utube_videos',
  SEARCH_HISTORY: '@rn_utube_search_history',
} as const;

// App state
export interface LibraryState {
  playlists: Playlist[];
  favorites: Favorites;
  watchLater: WatchLater;
  history: HistoryItem[];
  videos: Record<string, VideoRef>; // videoId -> VideoRef
}
