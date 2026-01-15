// Library Context for managing playlists, favorites, watch later, and history

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LibraryState, Playlist, VideoRef, HistoryItem, SearchHistory } from '../storage/types';
import * as storage from '../storage/asyncStorage';
import { generateId } from '../utils/id';
import { getThumbnailUrl } from '../utils/youtube';

interface LibraryContextType {
  state: LibraryState;
  loading: boolean;

  // Playlist operations
  createPlaylist: (name: string) => Promise<void>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  renamePlaylist: (playlistId: string, newName: string) => Promise<void>;
  addVideoToPlaylist: (playlistId: string, videoId: string, title: string) => Promise<void>;
  removeVideoFromPlaylist: (playlistId: string, videoId: string) => Promise<void>;

  // Favorites operations
  toggleFavorite: (videoId: string, title: string) => Promise<void>;
  isFavorite: (videoId: string) => boolean;

  // Watch Later operations
  toggleWatchLater: (videoId: string, title: string) => Promise<void>;
  isInWatchLater: (videoId: string) => boolean;

  // History operations
  addToHistory: (videoId: string) => Promise<void>;
  clearHistory: () => Promise<void>;

  // Search history operations
  searchHistory: SearchHistory;
  addToSearchHistory: (keyword: string) => Promise<void>;
  getRandomSearchKeywords: (count: number) => string[];

  // Video metadata
  getVideo: (videoId: string) => VideoRef | undefined;
  cacheVideo: (video: VideoRef) => Promise<void>;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

interface LibraryProviderProps {
  children: React.ReactNode;
}

export function LibraryProvider({ children }: LibraryProviderProps) {
  const [state, setState] = useState<LibraryState>({
    playlists: [],
    favorites: [],
    watchLater: [],
    history: [],
    videos: {},
  });
  const [searchHistory, setSearchHistory] = useState<SearchHistory>([]);
  const [loading, setLoading] = useState(true);

  // Load data from AsyncStorage on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [playlists, favorites, watchLater, history, videos, searchHistoryData] = await Promise.all([
        storage.getPlaylists(),
        storage.getFavorites(),
        storage.getWatchLater(),
        storage.getHistory(),
        storage.getVideos(),
        storage.getSearchHistory(),
      ]);

      setState({
        playlists,
        favorites,
        watchLater,
        history,
        videos,
      });
      setSearchHistory(searchHistoryData);
    } catch (error) {
      console.error('Error loading library data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Playlist operations
  const createPlaylist = useCallback(async (name: string) => {
    const newPlaylist: Playlist = {
      id: generateId(),
      name,
      videoIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedPlaylists = [...state.playlists, newPlaylist];
    await storage.savePlaylists(updatedPlaylists);
    setState((prev) => ({ ...prev, playlists: updatedPlaylists }));
  }, [state.playlists]);

  const deletePlaylist = useCallback(async (playlistId: string) => {
    const updatedPlaylists = state.playlists.filter((p) => p.id !== playlistId);
    await storage.savePlaylists(updatedPlaylists);
    setState((prev) => ({ ...prev, playlists: updatedPlaylists }));
  }, [state.playlists]);

  const renamePlaylist = useCallback(async (playlistId: string, newName: string) => {
    const updatedPlaylists = state.playlists.map((p) =>
      p.id === playlistId ? { ...p, name: newName, updatedAt: new Date().toISOString() } : p
    );
    await storage.savePlaylists(updatedPlaylists);
    setState((prev) => ({ ...prev, playlists: updatedPlaylists }));
  }, [state.playlists]);

  const addVideoToPlaylist = useCallback(async (playlistId: string, videoId: string, title: string) => {
    const updatedPlaylists = state.playlists.map((p) => {
      if (p.id === playlistId && !p.videoIds.includes(videoId)) {
        return {
          ...p,
          videoIds: [...p.videoIds, videoId],
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });

    await storage.savePlaylists(updatedPlaylists);
    setState((prev) => ({ ...prev, playlists: updatedPlaylists }));

    // Cache video metadata
    if (!state.videos[videoId]) {
      await cacheVideo({
        videoId,
        title,
        thumbnailUrl: getThumbnailUrl(videoId),
        addedAt: new Date().toISOString(),
      });
    }
  }, [state.playlists, state.videos]);

  const removeVideoFromPlaylist = useCallback(async (playlistId: string, videoId: string) => {
    const updatedPlaylists = state.playlists.map((p) => {
      if (p.id === playlistId) {
        return {
          ...p,
          videoIds: p.videoIds.filter((id) => id !== videoId),
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });

    await storage.savePlaylists(updatedPlaylists);
    setState((prev) => ({ ...prev, playlists: updatedPlaylists }));
  }, [state.playlists]);

  // Favorites operations
  const toggleFavorite = useCallback(async (videoId: string, title: string) => {
    const updatedFavorites = state.favorites.includes(videoId)
      ? state.favorites.filter((id) => id !== videoId)
      : [...state.favorites, videoId];

    await storage.saveFavorites(updatedFavorites);
    setState((prev) => ({ ...prev, favorites: updatedFavorites }));

    // Cache video metadata
    if (!state.videos[videoId]) {
      await cacheVideo({
        videoId,
        title,
        thumbnailUrl: getThumbnailUrl(videoId),
        addedAt: new Date().toISOString(),
      });
    }
  }, [state.favorites, state.videos]);

  const isFavorite = useCallback((videoId: string) => {
    return state.favorites.includes(videoId);
  }, [state.favorites]);

  // Watch Later operations
  const toggleWatchLater = useCallback(async (videoId: string, title: string) => {
    const updatedWatchLater = state.watchLater.includes(videoId)
      ? state.watchLater.filter((id) => id !== videoId)
      : [...state.watchLater, videoId];

    await storage.saveWatchLater(updatedWatchLater);
    setState((prev) => ({ ...prev, watchLater: updatedWatchLater }));

    // Cache video metadata
    if (!state.videos[videoId]) {
      await cacheVideo({
        videoId,
        title,
        thumbnailUrl: getThumbnailUrl(videoId),
        addedAt: new Date().toISOString(),
      });
    }
  }, [state.watchLater, state.videos]);

  const isInWatchLater = useCallback((videoId: string) => {
    return state.watchLater.includes(videoId);
  }, [state.watchLater]);

  // History operations
  const addToHistory = useCallback(async (videoId: string) => {
    const historyItem: HistoryItem = {
      videoId,
      playedAt: new Date().toISOString(),
    };

    // Remove existing entry for this video, then add new one at the front
    const updatedHistory = [
      historyItem,
      ...state.history.filter((h) => h.videoId !== videoId),
    ].slice(0, 100); // Keep last 100 items

    await storage.saveHistory(updatedHistory);
    setState((prev) => ({ ...prev, history: updatedHistory }));

    // Update lastPlayedAt for the video
    if (state.videos[videoId]) {
      const updatedVideos = {
        ...state.videos,
        [videoId]: {
          ...state.videos[videoId],
          lastPlayedAt: new Date().toISOString(),
        },
      };
      await storage.saveVideos(updatedVideos);
      setState((prev) => ({ ...prev, videos: updatedVideos }));
    }
  }, [state.history, state.videos]);

  const clearHistory = useCallback(async () => {
    await storage.saveHistory([]);
    setState((prev) => ({ ...prev, history: [] }));
  }, []);

  // Search history operations
  const addToSearchHistory = useCallback(async (keyword: string) => {
    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) return;

    // Remove existing entry for this keyword, then add new one at the front
    const updatedSearchHistory = [
      trimmedKeyword,
      ...searchHistory.filter((k) => k.toLowerCase() !== trimmedKeyword.toLowerCase()),
    ].slice(0, 10); // Keep last 10 keywords

    await storage.saveSearchHistory(updatedSearchHistory);
    setSearchHistory(updatedSearchHistory);
  }, [searchHistory]);

  const getRandomSearchKeywords = useCallback((count: number) => {
    if (searchHistory.length === 0) return [];

    const shuffled = [...searchHistory].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, searchHistory.length));
  }, [searchHistory]);

  // Video metadata
  const getVideo = useCallback((videoId: string) => {
    return state.videos[videoId];
  }, [state.videos]);

  const cacheVideo = useCallback(async (video: VideoRef) => {
    const updatedVideos = {
      ...state.videos,
      [video.videoId]: video,
    };
    await storage.saveVideos(updatedVideos);
    setState((prev) => ({ ...prev, videos: updatedVideos }));
  }, [state.videos]);

  return (
    <LibraryContext.Provider
      value={{
        state,
        loading,
        createPlaylist,
        deletePlaylist,
        renamePlaylist,
        addVideoToPlaylist,
        removeVideoFromPlaylist,
        toggleFavorite,
        isFavorite,
        toggleWatchLater,
        isInWatchLater,
        addToHistory,
        clearHistory,
        searchHistory,
        addToSearchHistory,
        getRandomSearchKeywords,
        getVideo,
        cacheVideo,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within LibraryProvider');
  }
  return context;
}
