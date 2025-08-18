import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '@/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'large' | 'medium' | 'small';
  loading?: boolean;
  disabled?: boolean;
  style?: any;
  textStyle?: any;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? theme.colors.neutral.white : theme.colors.primary.main}
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  
  // Variants
  primary: {
    backgroundColor: theme.colors.primary.main,
  },
  secondary: {
    backgroundColor: theme.colors.background.tertiary,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  
  // Sizes
  large: {
    height: 50,
    paddingHorizontal: 24,
  },
  medium: {
    height: 44,
    paddingHorizontal: 20,
  },
  small: {
    height: 32,
    paddingHorizontal: 16,
  },
  
  // States
  disabled: {
    opacity: 0.5,
  },
  
  // Text styles
  text: {
    fontWeight: theme.typography.fontWeight.medium,
  },
  primaryText: {
    color: theme.colors.neutral.white,
  },
  secondaryText: {
    color: theme.colors.neutral.gray700,
  },
  ghostText: {
    color: theme.colors.primary.main,
  },
  
  // Text sizes
  largeText: {
    fontSize: theme.typography.fontSize.large,
  },
  mediumText: {
    fontSize: theme.typography.fontSize.body,
  },
  smallText: {
    fontSize: theme.typography.fontSize.small,
  },
  
  disabledText: {
    color: theme.colors.neutral.gray500,
  },
});