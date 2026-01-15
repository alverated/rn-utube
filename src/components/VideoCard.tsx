// VideoCard component - YouTube-style video card

import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { VideoSearchResult } from '../providers/searchProvider';
import { formatNumber, formatDuration } from '../utils/format';

interface VideoCardProps {
  video: VideoSearchResult;
  onPress: () => void;
}

export function VideoCard({ video, onPress }: VideoCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      activeOpacity={0.7}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        {!imageError ? (
          <Image
            source={{ uri: video.thumbnailUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Text style={styles.placeholderIcon}>🎬</Text>
          </View>
        )}
        {video.duration && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>
              {formatDuration(video.duration)}
            </Text>
          </View>
        )}
      </View>

      {/* Video Info */}
      <View style={styles.infoContainer}>
        <View style={styles.textContainer}>
          <Text
            style={styles.title}
            numberOfLines={2}
          >
            {video.title}
          </Text>
          <View style={styles.metaContainer}>
            <Text style={styles.metaText} numberOfLines={1}>
              {video.channelName}
            </Text>
            {video.views && (
              <Text style={styles.metaText}>
                {formatNumber(video.views)} views {video.publishedAt && `• ${video.publishedAt}`}
              </Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    backgroundColor: '#0F0F0F',
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: 208,
    backgroundColor: '#282828',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: 208,
    backgroundColor: '#282828',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 48,
    opacity: 0.5,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  infoContainer: {
    padding: 12,
    flexDirection: 'row',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 20,
  },
  metaContainer: {
    marginTop: 4,
  },
  metaText: {
    color: '#AAAAAA',
    fontSize: 14,
  },
});
