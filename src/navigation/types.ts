// Navigation types for React Navigation

export type RootStackParamList = {
  MainTabs: undefined;
  Player: { videoId: string; title?: string };
  VideoDetail: { videoId: string };
  PlaylistDetail: { playlistId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Search: { query?: string };
  Library: undefined;
  Settings: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
