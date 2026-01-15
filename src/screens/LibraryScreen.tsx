// LibraryScreen - View playlists, favorites, watch later, and history

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useLibrary } from '../state/LibraryContext';
import { VideoCard } from '../components/VideoCard';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function LibraryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { state, getVideo, createPlaylist } = useLibrary();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  // Get watch later videos
  const watchLaterVideos = state.watchLater.map((videoId) => {
    const video = getVideo(videoId);
    return video ? {
      videoId: video.videoId,
      title: video.title,
      channelName: video.channelName || 'Unknown',
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
    } : null;
  }).filter(Boolean);

  const handleCreatePlaylist = async () => {
    if (newPlaylistName.trim()) {
      await createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setShowCreateModal(false);
    }
  };

  // Get favorite videos
  const favoriteVideos = state.favorites.map((videoId) => {
    const video = getVideo(videoId);
    return video ? {
      videoId: video.videoId,
      title: video.title,
      channelName: video.channelName || 'Unknown',
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
    } : null;
  }).filter(Boolean);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Library</Text>
        </View>

        {/* Playlists Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Playlists</Text>
            <TouchableOpacity
              onPress={() => setShowCreateModal(true)}
              style={styles.createButton}
            >
              <Text style={styles.createButtonText}>+ Create</Text>
            </TouchableOpacity>
          </View>

          {state.playlists.length === 0 ? (
            <Text style={styles.emptyText}>
              No playlists yet
            </Text>
          ) : (
            state.playlists.map((playlist) => (
              <TouchableOpacity
                key={playlist.id}
                onPress={() => navigation.navigate('PlaylistDetail', { playlistId: playlist.id })}
                style={styles.playlistItem}
              >
                <Text style={styles.playlistName}>{playlist.name}</Text>
                <Text style={styles.playlistCount}>
                  {playlist.videoIds.length} videos
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Watch Later Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Watch Later ({watchLaterVideos.length})
          </Text>
          {watchLaterVideos.length === 0 ? (
            <Text style={styles.emptyText}>
              No videos in Watch Later
            </Text>
          ) : (
            watchLaterVideos.slice(0, 3).map((video: any) => (
              <VideoCard
                key={video.videoId}
                video={video}
                onPress={() => navigation.navigate('Player', {
                  videoId: video.videoId,
                  title: video.title
                })}
              />
            ))
          )}
        </View>

        {/* Favorites Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Favorites ({favoriteVideos.length})
          </Text>
          {favoriteVideos.length === 0 ? (
            <Text style={styles.emptyText}>
              No favorite videos yet
            </Text>
          ) : (
            favoriteVideos.slice(0, 3).map((video: any) => (
              <VideoCard
                key={video.videoId}
                video={video}
                onPress={() => navigation.navigate('Player', {
                  videoId: video.videoId,
                  title: video.title
                })}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Create Playlist Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Create Playlist</Text>
            <TextInput
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              placeholder="Playlist name"
              placeholderTextColor="#666"
              style={styles.modalInput}
              autoFocus
              onSubmitEditing={handleCreatePlaylist}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => {
                  setNewPlaylistName('');
                  setShowCreateModal(false);
                }}
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreatePlaylist}
                style={[styles.modalButton, styles.createModalButton]}
              >
                <Text style={styles.createModalButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  count: {
    color: '#AAAAAA',
  },
  emptyText: {
    color: '#AAAAAA',
    textAlign: 'center',
    paddingVertical: 16,
  },
  playlistItem: {
    backgroundColor: '#282828',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  playlistName: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  playlistCount: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  createButton: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#282828',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#0F0F0F',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#444444',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  createModalButton: {
    backgroundColor: '#FF0000',
  },
  createModalButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
