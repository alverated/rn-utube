// PlayerScreen - YouTube video player with react-native-youtube-iframe

import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import YoutubePlayer, { PLAYER_STATES } from "react-native-youtube-iframe";
import { RootStackParamList } from "../navigation/types";
import { useLibrary } from "../state/LibraryContext";
import { formatNumber } from "../utils/format";
import { VideoCard } from "../components/VideoCard";
import { ytSearchProvider } from "../providers/ytSearchProvider";
import { VideoSearchResult } from "../providers/searchProvider";

type PlayerRouteProp = RouteProp<RootStackParamList, "Player">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function PlayerScreen() {
  const route = useRoute<PlayerRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { videoId, title } = route.params;
  const {
    state,
    addToHistory,
    toggleFavorite,
    toggleWatchLater,
    isFavorite,
    isInWatchLater,
    cacheVideo,
    addVideoToPlaylist,
    getVideo,
  } = useLibrary();

  const [playing, setPlaying] = useState(true);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [relatedVideos, setRelatedVideos] = useState<VideoSearchResult[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const isVideoFavorite = isFavorite(videoId);
  const isVideoInWatchLater = isInWatchLater(videoId);

  // Get video details from cache
  const videoDetails = getVideo(videoId);

  useEffect(() => {
    // Reset playing state to true when videoId changes
    setPlaying(true);

    // Add to history when player loads
    addToHistory(videoId);

    // Cache video if we have a title
    if (title) {
      cacheVideo({
        videoId,
        title,
        channelName: "",
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        addedAt: new Date().toISOString(),
      });
    }

    // Fetch related videos
    const fetchRelatedVideos = async () => {
      if (title) {
        setLoadingRelated(true);
        try {
          const results = await ytSearchProvider.searchVideos(title, 10);
          // Filter out the current video
          const filtered = results.filter((v) => v.videoId !== videoId);
          setRelatedVideos(filtered);
        } catch (error) {
          console.error("Error fetching related videos:", error);
        } finally {
          setLoadingRelated(false);
        }
      }
    };

    fetchRelatedVideos();
  }, [videoId, title]);

  const onStateChange = useCallback((state: PLAYER_STATES) => {
    if (state === PLAYER_STATES.ENDED) {
      setPlaying(false);
    }
  }, []);

  const handleToggleFavorite = () => {
    toggleFavorite(videoId, title || "Unknown Video");
  };

  const handleToggleWatchLater = () => {
    toggleWatchLater(videoId, title || "Unknown Video");
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    await addVideoToPlaylist(playlistId, videoId, title || "Unknown Video");
    setShowPlaylistModal(false);
    Alert.alert("Success", "Video added to playlist");
  };

  return (
    <View style={styles.container}>
      {/* Video Player */}
      <View style={styles.playerContainer}>
        <YoutubePlayer
          height={220}
          play={playing}
          videoId={videoId}
          onChangeState={onStateChange}
          onReady={() => setPlaying(true)}
          initialPlayerParams={{
            autoplay: 1,
            controls: false,
          }}
        />
      </View>

      <ScrollView style={styles.content}>
        {/* Video Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{title || videoId}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            onPress={handleToggleFavorite}
            style={[
              styles.actionButton,
              isVideoFavorite
                ? styles.actionButtonActive
                : styles.actionButtonInactive,
            ]}
          >
            <Text style={styles.actionButtonText}>
              {isVideoFavorite ? "❤️ Favorited" : "🤍 Favorite"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleToggleWatchLater}
            style={[
              styles.actionButton,
              isVideoInWatchLater
                ? styles.actionButtonActive
                : styles.actionButtonInactive,
            ]}
          >
            <Text style={styles.actionButtonText}>
              {isVideoInWatchLater ? "✓ Saved" : "+ Watch Later"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowPlaylistModal(true)}
            style={[styles.actionButton, styles.actionButtonInactive]}
          >
            <Text style={styles.actionButtonText}>+ Playlist</Text>
          </TouchableOpacity>
        </View>

        {/* Video Details */}
        <View style={styles.detailsContainer}>
          {videoDetails?.channelName && (
            <Text style={styles.channelText}>{videoDetails.channelName}</Text>
          )}
          {videoDetails?.views && (
            <Text style={styles.viewsText}>
              {formatNumber(videoDetails.views)} views
            </Text>
          )}
        </View>

        {/* Related Videos */}
        {relatedVideos.length > 0 && (
          <View style={styles.relatedContainer}>
            <Text style={styles.relatedTitle}>Related Videos</Text>
            {relatedVideos.map((video) => (
              <VideoCard
                key={video.videoId}
                video={video}
                onPress={() =>
                  navigation.push("Player", {
                    videoId: video.videoId,
                    title: video.title,
                  })
                }
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Playlist Modal */}
      <Modal
        visible={showPlaylistModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPlaylistModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Save to Playlist</Text>
              <TouchableOpacity
                onPress={() => setShowPlaylistModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {state.playlists.length === 0 ? (
              <View style={styles.emptyPlaylistsContainer}>
                <Text style={styles.emptyPlaylistsText}>
                  No playlists yet. Create one in the Library tab.
                </Text>
              </View>
            ) : (
              <FlatList
                data={state.playlists}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleAddToPlaylist(item.id)}
                    style={styles.playlistOption}
                  >
                    <View>
                      <Text style={styles.playlistOptionName}>{item.name}</Text>
                      <Text style={styles.playlistOptionCount}>
                        {item.videoIds.length} videos
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                style={styles.playlistList}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
  },
  playerContainer: {
    width: "100%",
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
  },
  infoContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#282828",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  actionsContainer: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderBottomColor: "#282828",
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtonActive: {
    backgroundColor: "#FF0000",
  },
  actionButtonInactive: {
    backgroundColor: "#282828",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  detailsContainer: {
    padding: 16,
  },
  channelText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 4,
  },
  viewsText: {
    color: "#AAAAAA",
    fontSize: 14,
  },
  relatedContainer: {
    padding: 16,
  },
  relatedTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#282828",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 24,
  },
  emptyPlaylistsContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyPlaylistsText: {
    color: "#AAAAAA",
    fontSize: 16,
    textAlign: "center",
  },
  playlistList: {
    maxHeight: 400,
  },
  playlistOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
  },
  playlistOptionName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  playlistOptionCount: {
    color: "#AAAAAA",
    fontSize: 14,
  },
});
