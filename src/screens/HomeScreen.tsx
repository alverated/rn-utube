// HomeScreen - Main screen with search and recently watched

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useLibrary } from "../state/LibraryContext";
import { VideoCard } from "../components/VideoCard";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { state, getVideo } = useLibrary();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navigate to Search tab with query
      navigation.navigate("Search", { query: searchQuery });
    }
  };

  // Get recent history videos
  const recentVideos = state.history
    .slice(0, 10)
    .map((h) => {
      const video = getVideo(h.videoId);
      return video
        ? {
            videoId: video.videoId,
            title: video.title,
            channelName: video.channelName || "Unknown",
            thumbnailUrl: video.thumbnailUrl,
            duration: video.duration,
          }
        : null;
    })
    .filter(Boolean);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView>
        {/* Header with Search */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Home</Text>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search"
              placeholderTextColor="#666"
              style={styles.searchInput}
              autoCapitalize="none"
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
          </View>
        </View>

        {/* Recent History */}
        {recentVideos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recently Watched</Text>
            {recentVideos.map((video) => (
              <VideoCard
                key={video?.videoId}
                video={video}
                onPress={() =>
                  navigation.navigate("Player", {
                    videoId: video?.videoId || "",
                    title: video?.title || "",
                  })
                }
              />
            ))}
          </View>
        )}

        {/* Empty State */}
        {recentVideos.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No videos watched yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Search for videos above to get started
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#282828",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#282828",
    color: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  emptyState: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  emptyStateText: {
    color: "#AAAAAA",
    fontSize: 18,
    textAlign: "center",
  },
  emptyStateSubtext: {
    color: "#AAAAAA",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
});
