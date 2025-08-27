import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppNavigator from '@/navigation/AppNavigator';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useSettingsStore } from '@/stores/settingsStore';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Settings store for theme management
  const { initialize, isDarkMode, updateSettings } = useSettingsStore();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize settings store (loads theme preference)
      await initialize();
      setIsReady(true);
    } catch (err) {
      console.error('App initialization failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleThemeChange = async (isDark: boolean) => {
    await updateSettings({
      display: {
        dark_mode: isDark,
      }
    });
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Text style={styles.errorSubtext}>Please restart the app</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ThemeProvider
      isDarkMode={isDarkMode()}
      onThemeChange={handleThemeChange}
    >
      <AppNavigator />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});
