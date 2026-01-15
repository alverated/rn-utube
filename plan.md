# Claude Code Prompt / PRD: Local YouTube Playlist Player (App-only)

Owner: Alver Noquiao
Platform: React Native (Expo) + TypeScript
Player: YouTube iframe embed (ad-free viewing)
Search: youtubei / yt-search / cheerio (no API key required)
Storage: Local AsyncStorage
Goal: Build a YouTube-like personal player app with search, playlists, and ad-free viewing with NO backend server.

---

## 0) Hard Constraints

- **NO backend/server required** - 100% client-side app
- **NO third-party services** - no external databases, no cloud storage, no APIs
- **100% local storage only** - all data stored on device using AsyncStorage
- Must work fully **offline** for all library features (playlists/history/favorites)
- Video playback uses YouTube iframe embed to avoid ads
- Search uses youtubei, yt-search, or cheerio (NO YouTube API key required)
- Downloading videos: OUT OF SCOPE for now

---

## 1) Core Features (MVP)

### 1.1 Playback (Ad-Free via iframe)

- Player screen using WebView with YouTube iframe embed:
  - Embed URL: `https://www.youtube.com/embed/{videoId}?autoplay=1&rel=0`
  - Use `react-native-webview` component
- Must support:
  - Fullscreen capability
  - Basic playback controls (handled by iframe player)
  - Automatic ad-blocking via iframe embed (no pre-roll ads)
- When video starts playing:
  - Update History and lastPlayedAt for the video
  - Track video in watch history

### 1.2 Local Library (AsyncStorage Only)

**Everything stored on device** - no cloud, no backend, no third-party services.

All data persists across app restarts using **AsyncStorage**:

- **Playlists** (create, read, update, delete)
  - Stored as JSON in AsyncStorage
  - Each playlist has: id, name, videoIds[], createdAt, updatedAt
- **Playlist items** (add video, remove video, reorder)
- **Watch Later** (special playlist stored separately)
- **Favorites** (array of videoIds in AsyncStorage)
- **History** (array of {videoId, playedAt} in AsyncStorage)

**Data Model**: Plain JSON objects, no database required

### 1.3 Add Video

- Add video by:
  - YouTube URL (watch, youtu.be, shorts)
  - raw videoId
- App extracts `videoId`.
- Optional title input (if metadata not available).
- Derive thumbnail without API:
  - `https://img.youtube.com/vi/{videoId}/hqdefault.jpg`

---

## 2) Search (No API Key Required)

Implement YouTube search using scraping libraries that work without API keys.

### 2.1 Search Implementation Options

Choose ONE of the following libraries:

**Option A: yt-search**
- NPM: `yt-search`
- Pure Node.js, no API key required
- Returns: videoId, title, thumbnail, channel, duration, views
- Pros: Simple API, TypeScript support
- Cons: May break if YouTube changes HTML

**Option B: youtubei (YouTube Internal API)**
- NPM: `youtubei.js` or similar wrapper
- Uses YouTube's internal InnerTube API
- No API key required
- Pros: More stable, richer metadata
- Cons: Larger bundle size

**Option C: cheerio (HTML scraping)**
- NPM: `cheerio` + `axios`
- Direct HTML parsing of YouTube search results
- Pros: Full control, lightweight
- Cons: Fragile, requires maintenance

### 2.2 SearchProvider Interface

Create abstraction to allow swapping implementations:

```typescript
interface SearchProvider {
  searchVideos(query: string, limit?: number): Promise<VideoSearchResult[]>
  getVideoDetails(videoId: string): Promise<VideoDetail | null>
}

interface VideoSearchResult {
  videoId: string
  title: string
  channelName: string
  thumbnailUrl: string
  duration?: string
  views?: string
  publishedAt?: string
}

interface VideoDetail extends VideoSearchResult {
  description?: string
  channelId?: string
}
```

### 2.3 Search Features

- Real-time search with debounce (500ms)
- Display search results with thumbnails
- Infinite scroll/pagination support
- Cache results in-memory per session
- Handle errors gracefully (show retry button)
- Empty states for no results

### 2.4 Implementation Priority

1. Start with **yt-search** (easiest to integrate)
2. Add option to switch providers in Settings
3. Keep SearchProvider interface flexible for future providers

---

## 3) Screens & Navigation

Bottom tabs:

- Home
- Search
- Library
- Settings

Screens:

- HomeScreen
  - Recent history
  - Your playlists
  - Quick action: Paste URL/ID
- SearchScreen
  - Search input
  - Results list (infinite scroll)
  - Filters (optional)
- VideoDetailScreen
  - Player preview or play button
  - Title, channel row
  - Buttons: Watch Later, Favorite, Add to Playlist
  - Related videos list
- ChannelScreen
  - Channel header
  - Channel videos list (infinite scroll)
- LibraryScreen
  - Playlists
  - Watch Later
  - Favorites
  - History
- PlaylistDetailScreen
  - Playlist name + item list
- SettingsScreen
  - Switch search provider (yt-search/youtubei/cheerio)
  - Clear history
  - Clear all playlists
  - Export/Import library JSON (nice-to-have)

---

## 4) Local Data Model (AsyncStorage Only - NO Database)

**Storage Method**: AsyncStorage (React Native's local key-value storage)
**Storage Location**: Device only
**No external services**: No Firebase, no Supabase, no cloud databases

### Storage Keys:

```typescript
// AsyncStorage keys
const STORAGE_KEYS = {
  PLAYLISTS: '@rn_utube_playlists',
  FAVORITES: '@rn_utube_favorites',
  WATCH_LATER: '@rn_utube_watch_later',
  HISTORY: '@rn_utube_history',
  VIDEOS: '@rn_utube_videos', // video metadata cache
}
```

### Data Entities (stored as JSON):

```typescript
// Playlist stored in AsyncStorage
interface Playlist {
  id: string
  name: string
  videoIds: string[]
  createdAt: string
  updatedAt: string
}

// Video metadata (cached from search results)
interface VideoRef {
  videoId: string
  title: string
  thumbnailUrl: string
  channelName?: string
  duration?: string
  addedAt: string
  lastPlayedAt?: string
}

// History entry
interface HistoryItem {
  videoId: string
  playedAt: string
}

// Simple arrays for Favorites and Watch Later
type Favorites = string[] // videoIds
type WatchLater = string[] // videoIds
```

### Rules:

- No duplicates in Favorites/WatchLater
- Prevent duplicate videos in same playlist (optional: allow duplicates via setting)
- Deleting a playlist removes it from storage, but keeps video metadata
- All mutations immediately persist to AsyncStorage

### Persistence Strategy:

- On each mutation, write to AsyncStorage immediately
- Use debounce (300ms) to avoid excessive writes during rapid operations
- Keep in-memory cache synced with AsyncStorage
- No need for complex database migrations - just JSON

---

## 5) UX Requirements

- Use FlashList (preferred) for lists.
- Video cards show thumbnail + title fallback.
- Add-to-playlist uses a bottom sheet:
  - Watch Later toggle
  - Favorite toggle
  - Choose playlist
  - Create new playlist

Empty states:

- No playlists: show “Create playlist”
- No history: show “Start watching”
- Search without API key: show prompt with Settings link

---

## 6) Acceptance Criteria (MVP)

- App runs on iOS + Android.
- Can paste a YouTube URL/ID and play it using `react-native-youtube-iframe`.
- Playlists persist across restarts.
- Watch Later, Favorites, History persist.
- Search and channel browsing work via the default provider when API key is set.
- Swapping provider is possible by implementing the SearchProvider interface (no screen changes required).

---

## 7) Implementation Structure (Required)

```
/src
  /components
    VideoCard.tsx
    PlaylistCard.tsx
    SearchBar.tsx
    AddToPlaylistSheet.tsx
  /screens
    HomeScreen.tsx
    SearchScreen.tsx
    VideoDetailScreen.tsx
    PlayerScreen.tsx
    LibraryScreen.tsx
    PlaylistDetailScreen.tsx
    SettingsScreen.tsx
  /navigation
    AppNavigator.tsx
    types.ts
  /state
    useLibrary.ts (playlists, favorites, watch later, history)
    LibraryContext.tsx
  /storage
    asyncStorage.ts (read/write operations)
    types.ts (data models)
  /providers
    searchProvider.ts (interface)
    ytSearchProvider.ts (yt-search implementation)
    youtubeiProvider.ts (youtubei.js - optional)
    cheerioProvider.ts (cheerio - optional)
  /utils
    youtube.ts (extract videoId, derive thumbnail)
    id.ts (uuid generator)
```

---

## 8) Dependencies

### Core
- `expo` (latest)
- `react-native` (via Expo)
- `typescript`
- `@react-navigation/native`
- `@react-navigation/bottom-tabs`
- `@react-navigation/native-stack`

### UI Components
- `react-native-webview` (for iframe player)
- `@gorhom/bottom-sheet` (add to playlist UI)
- `@shopify/flash-list` (performant lists)

### Storage
- `@react-native-async-storage/async-storage`

### Search (choose one to start)
- `yt-search` (recommended for MVP)
- `youtubei.js` (optional alternative)
- `cheerio` + `axios` (optional alternative)

### Utilities
- `uuid` (generate IDs)

---

## 9) Setup Instructions

### Step 1: Initialize React Native Project
```bash
npx create-expo-app@latest . --template blank-typescript
```

### Step 2: Install Dependencies
```bash
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
npm install react-native-webview
npm install @react-native-async-storage/async-storage
npm install @gorhom/bottom-sheet
npm install @shopify/flash-list
npm install yt-search
npm install uuid
npm install --save-dev @types/uuid
```

### Step 3: Configure Expo
Update `app.json`:
```json
{
  "expo": {
    "plugins": [
      "react-native-webview"
    ]
  }
}
```

### Step 4: Project Structure
- Create folders: `/src/components`, `/src/screens`, `/src/navigation`, `/src/state`, `/src/storage`, `/src/providers`, `/src/utils`
- Implement data models and storage layer first
- Build search provider interface
- Create navigation structure
- Implement screens incrementally

---

## 10) Development Phases

### Phase 1: Foundation (Day 1-2)
- Initialize Expo app with TypeScript
- Set up folder structure
- Create data models and types
- Implement AsyncStorage wrapper
- Build local library state management (Context + hooks)

### Phase 2: Core Features (Day 3-4)
- Implement video player with WebView iframe
- Create playlist CRUD operations
- Add Watch Later and Favorites functionality
- Build History tracking

### Phase 3: Search (Day 5-6)
- Implement SearchProvider interface
- Integrate yt-search provider
- Create SearchScreen with results
- Add debounced search input

### Phase 4: UI/UX (Day 7-8)
- Build all screens (Home, Library, VideoDetail, PlaylistDetail)
- Create reusable components (VideoCard, PlaylistCard)
- Add bottom sheet for "Add to Playlist"
- Implement navigation flow

### Phase 5: Polish (Day 9-10)
- Error handling and empty states
- Loading states and skeletons
- Settings screen
- Testing on iOS and Android
- Bug fixes and optimization
