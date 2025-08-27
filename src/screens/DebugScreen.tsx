import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/theme';
import { useAuthStore } from '@/stores/authStore';

export default function DebugScreen() {
  const { is_loading, is_authenticated, user, initialize } = useAuthStore();

  const handleInitialize = async () => {
    try {
      await initialize();
      Alert.alert('Success', 'Auth store initialized successfully');
    } catch (error) {
      Alert.alert('Error', `Auth initialization failed: ${error}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Debug Screen</Text>
        
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Loading: {is_loading ? 'Yes' : 'No'}</Text>
          <Text style={styles.label}>Authenticated: {is_authenticated ? 'Yes' : 'No'}</Text>
          <Text style={styles.label}>User: {user ? user.phone || 'Unknown' : 'None'}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleInitialize}>
          <Text style={styles.buttonText}>Test Auth Initialize</Text>
        </TouchableOpacity>

        <Text style={styles.helperText}>
          If this screen loads without errors, the basic integration is working.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'center',
  },
  title: {
    fontSize: theme.typography.fontSize.xxlarge,
    fontWeight: '700',
    color: theme.colors.neutral.gray900,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  infoContainer: {
    backgroundColor: theme.colors.neutral.white,
    padding: theme.spacing.lg,
    borderRadius: 12,
    marginBottom: theme.spacing.xl,
  },
  label: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.neutral.gray700,
    marginBottom: theme.spacing.sm,
  },
  button: {
    width: '100%',
    height: 56,
    backgroundColor: theme.colors.primary.blue600,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  buttonText: {
    fontSize: theme.typography.fontSize.medium,
    fontWeight: '600',
    color: theme.colors.neutral.white,
  },
  helperText: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.neutral.gray500,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
});