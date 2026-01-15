# RN UTube - Local YouTube Player

A React Native YouTube player app with ad-free viewing, local playlists, and NO backend server.

## Features

- **Ad-Free Video Playback** - YouTube iframe embed (no pre-roll ads)
- **YouTube Search** - Search videos without API key (using yt-search)
- **Local Playlists** - Create and manage playlists stored on device
- **Favorites & Watch Later** - Save videos locally
- **History** - Track watched videos
- **100% Offline Library** - All data stored in AsyncStorage
- **YouTube-Like UI** - Built with NativeWind/Tailwind CSS

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on platforms
npm run ios     # iOS
npm run android # Android
npm run web     # Web
```

## Tech Stack

- React Native (Expo)
- TypeScript
- NativeWind (Tailwind CSS)
- React Navigation
- AsyncStorage (local only)
- yt-search (no API key)
- react-native-webview

## Features Summary

### Search & Play
- Search YouTube without API key
- Ad-free video playback via iframe
- Automatic history tracking

### Library Management
- Create unlimited playlists
- Favorites & Watch Later
- Local storage only (NO cloud)

### YouTube-Like UI
- Dark theme by default
- Custom YouTube brand colors
- Clean, modern interface

## License

MIT