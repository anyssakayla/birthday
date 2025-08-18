export * from './colors';
export * from './typography';
export * from './spacing';

import { colors } from './colors';
import { typography, textStyles } from './typography';
import { spacing, componentSpacing } from './spacing';

// Shadows
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
};

// Border radius
export const borderRadius = {
  small: 8,
  medium: 12,
  large: 16,
  extraLarge: 20,
  round: 9999,
};

// Animation durations
export const animations = {
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
  },
};

// Complete theme object
export const theme = {
  colors,
  typography,
  textStyles,
  spacing,
  componentSpacing,
  shadows,
  borderRadius,
  animations,
};