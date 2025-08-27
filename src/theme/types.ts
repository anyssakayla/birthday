import { lightColors, darkColors } from './colors';
import { typography, textStyles } from './typography';
import { spacing, componentSpacing } from './spacing';

// Theme mode
export type ThemeMode = 'light' | 'dark';

// Color scheme type based on the light colors structure
export type ColorScheme = typeof lightColors;

// Complete theme interface
export interface Theme {
  mode: ThemeMode;
  colors: ColorScheme;
  typography: typeof typography;
  textStyles: typeof textStyles;
  spacing: typeof spacing;
  componentSpacing: typeof componentSpacing;
  shadows: {
    small: object;
    medium: object;
    large: object;
  };
  borderRadius: {
    small: number;
    medium: number;
    large: number;
    extraLarge: number;
    round: number;
  };
  animations: {
    duration: {
      instant: number;
      fast: number;
      normal: number;
      slow: number;
    };
  };
}

// Theme creation helper
export const createTheme = (mode: ThemeMode, colors: ColorScheme): Theme => ({
  mode,
  colors,
  typography,
  textStyles,
  spacing,
  componentSpacing,
  shadows: {
    small: {
      shadowColor: mode === 'dark' ? '#000' : '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: mode === 'dark' ? 0.25 : 0.04,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: mode === 'dark' ? '#000' : '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: mode === 'dark' ? 0.35 : 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    large: {
      shadowColor: mode === 'dark' ? '#000' : '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: mode === 'dark' ? 0.45 : 0.12,
      shadowRadius: 16,
      elevation: 5,
    },
  },
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
    extraLarge: 20,
    round: 9999,
  },
  animations: {
    duration: {
      instant: 100,
      fast: 200,
      normal: 300,
      slow: 500,
    },
  },
});

// Pre-built light and dark themes
export const lightTheme = createTheme('light', lightColors);
export const darkTheme = createTheme('dark', darkColors);