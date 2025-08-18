import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  android: {
    regular: 'Roboto',
    medium: 'Roboto-Medium',
    semibold: 'Roboto-Medium',
    bold: 'Roboto-Bold',
  },
  default: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
});

export const typography = {
  // Font families
  fontFamily,
  
  // Font sizes
  fontSize: {
    h1: 34,
    h2: 28,
    h3: 22,
    h4: 20,
    large: 17,
    body: 15,
    small: 13,
    tiny: 11,
  },
  
  // Font weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
};

// Pre-defined text styles
export const textStyles = {
  // Headers
  h1: {
    fontSize: typography.fontSize.h1,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.tight,
    lineHeight: typography.fontSize.h1 * typography.lineHeight.tight,
  },
  h2: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.tight,
    lineHeight: typography.fontSize.h2 * typography.lineHeight.tight,
  },
  h3: {
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.fontSize.h3 * typography.lineHeight.normal,
  },
  h4: {
    fontSize: typography.fontSize.h4,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.fontSize.h4 * typography.lineHeight.normal,
  },
  
  // Body text
  bodyLarge: {
    fontSize: typography.fontSize.large,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.fontSize.large * typography.lineHeight.normal,
  },
  body: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.fontSize.body * typography.lineHeight.normal,
  },
  bodySmall: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.fontSize.small * typography.lineHeight.normal,
  },
  
  // Special text
  button: {
    fontSize: typography.fontSize.large,
    fontWeight: typography.fontWeight.medium,
    letterSpacing: typography.letterSpacing.normal,
  },
  caption: {
    fontSize: typography.fontSize.tiny,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.fontSize.tiny * typography.lineHeight.normal,
  },
  sectionHeader: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.wide,
    textTransform: 'uppercase' as const,
  },
};