import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/theme';

export default function BirthdayDetailScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Birthday Detail Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: theme.typography.fontSize.large,
    color: theme.colors.neutral.gray700,
  },
});