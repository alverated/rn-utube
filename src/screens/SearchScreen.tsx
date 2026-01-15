// SearchScreen - Search for YouTube videos

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, MainTabParamList } from "../navigation/types";
import { VideoCard } from "../components/VideoCard";
import { VideoSearchResult } from "../providers/searchProvider";
import { ytSearchProvider } from "../providers/ytSearchProvider";
import { useLibrary } from "../state/LibraryContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SearchRouteProp = RouteProp<MainTabParamList, "Search">;

export function SearchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SearchRouteProp>();
  const { searchHistory, addToSearchHistory, getRandomSearchKeywords } =
    useLibrary();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<VideoSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Handle incoming query from Home screen
  useEffect(() => {
    if (route.params?.query) {
      setQuery(route.params.query);
      handleSearch(route.params.query);
    }
  }, [route.params?.query]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowSuggestions(true);
      return;
    }

    setLoading(true);
    setShowSuggestions(false);
    try {
      const videos = await ytSearchProvider.searchVideos(searchQuery, 20);
      setResults(videos);
      // Save search to history
      await addToSearchHistory(searchQuery.trim());
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQueryChange = (text: string) => {
    setQuery(text);

    // Debounce search
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      handleSearch(text);
    }, 500);

    setSearchTimeout(timeout);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Search Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
        <TextInput
          value={query}
          onChangeText={handleQueryChange}
          placeholder="Search"
          placeholderTextColor="#666"
          style={styles.searchInput}
          autoCapitalize="none"
        />
      </View>

      {/* Search Results */}
      {loading && (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#FF0000" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      )}

      {!loading && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.videoId}
          renderItem={({ item }) => (
            <VideoCard
              video={item}
              onPress={() =>
                navigation.navigate("Player", {
                  videoId: item.videoId,
                  title: item.title,
                })
              }
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      {!loading && query.trim() && results.length === 0 && (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No results found</Text>
          <Text style={styles.emptySubtext}>Try a different search term</Text>
        </View>
      )}

      {!loading && !query.trim() && results.length === 0 && showSuggestions && (
        <View style={styles.suggestionsContainer}>
          {searchHistory.length > 0 ? (
            <>
              <Text style={styles.suggestionsTitle}>Recent Searches</Text>
              {searchHistory.map((keyword, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => {
                    setQuery(keyword);
                    handleSearch(keyword);
                  }}
                >
                  <Text style={styles.suggestionIcon}>🔍</Text>
                  <Text style={styles.suggestionText}>{keyword}</Text>
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <View style={styles.centerContent}>
              <Text style={styles.emptyText}>Start searching for videos</Text>
            </View>
          )}
        </View>
      )}
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
  searchInput: {
    backgroundColor: "#282828",
    color: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#AAAAAA",
    marginTop: 16,
  },
  emptyText: {
    color: "#AAAAAA",
    fontSize: 18,
    textAlign: "center",
  },
  emptySubtext: {
    color: "#888888",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 32,
  },
  listContent: {
    padding: 16,
  },
  suggestionsContainer: {
    padding: 16,
  },
  suggestionsTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#282828",
    borderRadius: 8,
    marginBottom: 8,
  },
  suggestionIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  suggestionText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
});
