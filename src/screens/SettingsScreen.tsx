// SettingsScreen - App settings

import React from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLibrary } from '../state/LibraryContext';
import { clearAllData } from '../storage/asyncStorage';

export function SettingsScreen() {
  const { clearHistory } = useLibrary();

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear your watch history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
            Alert.alert('Success', 'History cleared');
          },
        },
      ]
    );
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all playlists, favorites, watch later, and history. This cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('Success', 'All data cleared. Please restart the app.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Info</Text>
          <Text style={styles.infoText}>RN UTube v1.0.0</Text>
          <Text style={styles.infoTextSecondary}>
            Local YouTube player with ad-free viewing
          </Text>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>

          <TouchableOpacity
            onPress={handleClearHistory}
            style={styles.actionButton}
          >
            <Text style={styles.actionButtonTitle}>Clear History</Text>
            <Text style={styles.actionButtonSubtitle}>
              Remove all watch history
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleClearAllData}
            style={styles.dangerButton}
          >
            <Text style={styles.actionButtonTitle}>Clear All Data</Text>
            <Text style={styles.actionButtonSubtitle}>
              Delete everything (playlists, favorites, history)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Storage Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage</Text>
          <Text style={styles.infoText}>
            All data is stored locally on your device using AsyncStorage.
            No data is sent to external servers.
          </Text>
        </View>
      </ScrollView>
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
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoText: {
    color: '#AAAAAA',
  },
  infoTextSecondary: {
    color: '#AAAAAA',
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: '#282828',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  dangerButton: {
    backgroundColor: '#7F1D1D',
    padding: 16,
    borderRadius: 8,
  },
  actionButtonTitle: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actionButtonSubtitle: {
    color: '#AAAAAA',
    fontSize: 14,
    marginTop: 4,
  },
});
