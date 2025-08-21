import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getAvatarGradient, theme } from '@/theme';

interface AvatarProps {
  name: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  imageUrl?: string;
  customColors?: string[];
  style?: any;
}

const sizeMap = {
  small: 32,
  medium: 48,
  large: 80,
  xlarge: 120,
};

const fontSizeMap = {
  small: 14,
  medium: 18,
  large: 32,
  xlarge: 48,
};

export default function Avatar({ 
  name, 
  size = 'medium', 
  imageUrl, 
  customColors,
  style 
}: AvatarProps) {
  const avatarSize = sizeMap[size];
  const fontSize = fontSizeMap[size];
  
  // Get initials from name
  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0].substring(0, 2).toUpperCase();
  };
  
  const initials = getInitials(name);
  const gradientColors = customColors || getAvatarGradient(name);
  
  if (imageUrl) {
    return (
      <View style={[styles.container, { width: avatarSize, height: avatarSize }, style]}>
        <Image 
          source={{ uri: imageUrl }} 
          style={[styles.image, { borderRadius: theme.borderRadius.large }]}
        />
      </View>
    );
  }
  
  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.gradient,
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius: theme.borderRadius.large,
        },
        style,
      ]}
    >
      <Text style={[styles.initials, { fontSize }]}>
        {initials}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    color: theme.colors.neutral.white,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});