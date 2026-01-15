// VideoDetailScreen - View video details before playing

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useLibrary } from '../state/LibraryContext';
import { ytSearchProvider } from '../providers/ytSearchProvider';
import { VideoDetail } from '../providers/searchProvider';
import { getThumbnailUrl } from '../utils/youtube';

type VideoDetailRouteProp = RouteProp<RootStackParamList, 'VideoDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function VideoDetailScreen() {
  const route = useRoute<VideoDetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { videoId } = route.params;
  const { toggleFavorite, toggleWatchLater, isFavorite, isInWatchLater } = useLibrary();

  const [video, setVideo] = useState<VideoDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const isVideoFavorite = isFavorite(videoId);
  const isVideoInWatchLater = isInWatchLater(videoId);

  useEffect(() => {
    loadVideoDetails();
  }, [videoId]);

  const loadVideoDetails = async () => {
    try {
      const details = await ytSearchProvider.getVideoDetails(videoId);
      setVideo(details);
    } catch (error) {
      console.error('Error loading video details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-youtube-darker items-center justify-center">
        <ActivityIndicator size="large" color="#FF0000" />
      </View>
    );
  }

  if (!video) {
    return (
      <View className="flex-1 bg-youtube-darker items-center justify-center">
        <Text className="text-youtube-gray text-lg">Video not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-youtube-darker">
      <ScrollView>
        {/* Thumbnail */}
        <Image
          source={{ uri: video.thumbnailUrl || getThumbnailUrl(videoId) }}
          className="w-full h-60 bg-youtube-dark"
          resizeMode="cover"
        />

        {/* Video Info */}
        <View className="p-4 border-b border-youtube-dark">
          <Text className="text-white text-xl font-bold">{video.title}</Text>
          <View className="mt-2">
            <Text className="text-youtube-gray">{video.channelName}</Text>
            {video.views && (
              <Text className="text-youtube-gray text-sm mt-1">
                {video.views} views {video.publishedAt && `• ${video.publishedAt}`}
              </Text>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="p-4 flex-row justify-around border-b border-youtube-dark">
          <TouchableOpacity
            onPress={() => toggleFavorite(videoId, video.title)}
            className={`flex-1 mx-2 px-4 py-3 rounded-lg ${isVideoFavorite ? 'bg-youtube-red' : 'bg-youtube-dark'}`}
          >
            <Text className="text-white font-semibold text-center">
              {isVideoFavorite ? '❤️ Favorited' : '🤍 Favorite'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => toggleWatchLater(videoId, video.title)}
            className={`flex-1 mx-2 px-4 py-3 rounded-lg ${isVideoInWatchLater ? 'bg-youtube-red' : 'bg-youtube-dark'}`}
          >
            <Text className="text-white font-semibold text-center">
              {isVideoInWatchLater ? '✓ Saved' : '+ Watch Later'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Play Button */}
        <View className="p-4">
          <TouchableOpacity
            onPress={() => navigation.navigate('Player', { videoId, title: video.title })}
            className="bg-youtube-red py-4 rounded-lg"
          >
            <Text className="text-white text-center font-bold text-lg">
              ▶ Play Video
            </Text>
          </TouchableOpacity>
        </View>

        {/* Description */}
        {video.description && (
          <View className="p-4 border-t border-youtube-dark">
            <Text className="text-white font-semibold mb-2">Description</Text>
            <Text className="text-youtube-gray">{video.description}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
