// AsyncStorage wrapper for local data persistence

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, Playlist, Favorites, WatchLater, HistoryItem, VideoRef, SearchHistory } from './types';

// Generic storage helpers
export async function saveData<T>(key: string, data: T): Promise<void> {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Error saving data for key ${key}:`, error);
    throw error;
  }
}

export async function getData<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : defaultValue;
  } catch (error) {
    console.error(`Error reading data for key ${key}:`, error);
    return defaultValue;
  }
}

export async function removeData(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing data for key ${key}:`, error);
    throw error;
  }
}

// Specific storage functions
export async function savePlaylists(playlists: Playlist[]): Promise<void> {
  return saveData(STORAGE_KEYS.PLAYLISTS, playlists);
}

export async function getPlaylists(): Promise<Playlist[]> {
  return getData<Playlist[]>(STORAGE_KEYS.PLAYLISTS, []);
}

export async function saveFavorites(favorites: Favorites): Promise<void> {
  return saveData(STORAGE_KEYS.FAVORITES, favorites);
}

export async function getFavorites(): Promise<Favorites> {
  return getData<Favorites>(STORAGE_KEYS.FAVORITES, []);
}

export async function saveWatchLater(watchLater: WatchLater): Promise<void> {
  return saveData(STORAGE_KEYS.WATCH_LATER, watchLater);
}

export async function getWatchLater(): Promise<WatchLater> {
  return getData<WatchLater>(STORAGE_KEYS.WATCH_LATER, []);
}

export async function saveHistory(history: HistoryItem[]): Promise<void> {
  return saveData(STORAGE_KEYS.HISTORY, history);
}

export async function getHistory(): Promise<HistoryItem[]> {
  return getData<HistoryItem[]>(STORAGE_KEYS.HISTORY, []);
}

export async function saveVideos(videos: Record<string, VideoRef>): Promise<void> {
  return saveData(STORAGE_KEYS.VIDEOS, videos);
}

export async function getVideos(): Promise<Record<string, VideoRef>> {
  return getData<Record<string, VideoRef>>(STORAGE_KEYS.VIDEOS, {});
}

export async function saveSearchHistory(searchHistory: SearchHistory): Promise<void> {
  return saveData(STORAGE_KEYS.SEARCH_HISTORY, searchHistory);
}

export async function getSearchHistory(): Promise<SearchHistory> {
  return getData<SearchHistory>(STORAGE_KEYS.SEARCH_HISTORY, []);
}

// Clear all data (for settings)
export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.PLAYLISTS,
      STORAGE_KEYS.FAVORITES,
      STORAGE_KEYS.WATCH_LATER,
      STORAGE_KEYS.HISTORY,
      STORAGE_KEYS.VIDEOS,
      STORAGE_KEYS.SEARCH_HISTORY,
    ]);
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
}
