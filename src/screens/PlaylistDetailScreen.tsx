// PlaylistDetailScreen - View and manage playlist contents

import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useLibrary } from '../state/LibraryContext';
import { VideoCard } from '../components/VideoCard';

type PlaylistDetailRouteProp = RouteProp<RootStackParamList, 'PlaylistDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function PlaylistDetailScreen() {
  const route = useRoute<PlaylistDetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { playlistId } = route.params;
  const { state, getVideo, removeVideoFromPlaylist, deletePlaylist } = useLibrary();

  const playlist = state.playlists.find((p) => p.id === playlistId);

  if (!playlist) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>Playlist not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const videos = playlist.videoIds.map((videoId) => {
    const video = getVideo(videoId);
    return video ? {
      videoId: video.videoId,
      title: video.title,
      channelName: video.channelName || 'Unknown',
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
    } : null;
  }).filter(Boolean);

  const handleDeletePlaylist = () => {
    Alert.alert(
      'Delete Playlist',
      `Are you sure you want to delete "${playlist.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deletePlaylist(playlistId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.playlistName}>{playlist.name}</Text>
            <Text style={styles.videoCount}>{playlist.videoIds.length} videos</Text>
          </View>
          <TouchableOpacity
            onPress={handleDeletePlaylist}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Videos */}
      {videos.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No videos in this playlist</Text>
        </View>
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item: any) => item.videoId}
          renderItem={({ item }: any) => (
            <View>
              <VideoCard
                video={item}
                onPress={() => navigation.navigate('Player', {
                  videoId: item.videoId,
                  title: item.title
                })}
              />
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    'Remove Video',
                    'Remove this video from the playlist?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Remove',
                        onPress: () => removeVideoFromPlaylist(playlistId, item.videoId),
                      },
                    ]
                  );
                }}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>
                  Remove from Playlist
                </Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  playlistName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  videoCount: {
    color: '#AAAAAA',
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: '#8B0000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#AAAAAA',
    fontSize: 18,
  },
  listContent: {
    padding: 16,
  },
  removeButton: {
    backgroundColor: '#282828',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  removeButtonText: {
    color: '#FF0000',
    textAlign: 'center',
    fontWeight: '600',
  },
});
