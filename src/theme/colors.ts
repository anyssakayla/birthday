// Base color palette - shared across themes
const baseColors = {
  // Primary colors
  primary: {
    main: '#0891b2',      // Primary blue
    dark: '#0e7490',
    light: '#06b6d4',
  },
  
  // Semantic colors
  success: {
    main: '#10b981',      // Green for today's birthdays
    dark: '#059669',
    light: '#34d399',
  },
  
  warning: {
    main: '#f97316',      // Orange for upcoming urgency
    dark: '#ea580c',
    light: '#fb923c',
  },
  
  error: {
    main: '#ef4444',
    dark: '#dc2626',
    light: '#f87171',
  },
};

// Light theme colors
export const lightColors = {
  ...baseColors,
  
  // Theme-specific colors
  text: {
    primary: '#1a1d23',    // Primary text (black)
    secondary: '#374151',  // Secondary text (dark gray)
    tertiary: '#64748b',   // Placeholder text (medium gray)
    inverse: '#ffffff',    // White text for dark backgrounds
  },
  
  background: {
    primary: '#ffffff',    // Main background
    secondary: '#f8fafc',  // Secondary background
    tertiary: '#f1f5f9',   // Tertiary background
    surface: '#ffffff',    // Card/surface background
    overlay: 'rgba(0, 0, 0, 0.5)', // Modal overlay
  },
  
  border: {
    light: '#e2e8f0',     // Light borders
    medium: '#cbd5e1',    // Medium borders
    focus: '#0891b2',     // Focus state
  },
  
  // Semantic background colors
  success: {
    ...baseColors.success,
    subtle: '#d1fae5',
  },
  
  warning: {
    ...baseColors.warning,
    subtle: '#fed7aa',
  },
  
  error: {
    ...baseColors.error,
    subtle: '#fee2e2',
  },
  
  primary: {
    ...baseColors.primary,
    subtle: '#f0f9ff',
  },
  
  // Legacy neutral colors for backward compatibility
  neutral: {
    black: '#000000',
    gray900: '#1a1d23',
    gray700: '#374151',
    gray500: '#64748b',
    gray300: '#cbd5e1',
    gray100: '#e2e8f0',
    gray50: '#f8fafc',
    white: '#ffffff',
  },
};

// Dark theme colors
export const darkColors = {
  ...baseColors,
  
  // Theme-specific colors
  text: {
    primary: '#ffffff',    // Primary text (white)
    secondary: '#d1d5db',  // Secondary text (light gray)
    tertiary: '#9ca3af',   // Placeholder text (medium gray)
    inverse: '#1a1d23',    // Dark text for light backgrounds
  },
  
  background: {
    primary: '#0f0f0f',    // Main background (almost black)
    secondary: '#1a1a1a',  // Secondary background (dark gray)
    tertiary: '#262626',   // Tertiary background (lighter gray)
    surface: '#1a1a1a',    // Card/surface background
    overlay: 'rgba(0, 0, 0, 0.8)', // Modal overlay
  },
  
  border: {
    light: '#374151',     // Light borders
    medium: '#4b5563',    // Medium borders
    focus: '#06b6d4',     // Focus state (brighter in dark mode)
  },
  
  // Semantic background colors (adjusted for dark theme)
  success: {
    ...baseColors.success,
    subtle: '#064e3b',    // Darker green background
  },
  
  warning: {
    ...baseColors.warning,
    subtle: '#7c2d12',    // Darker orange background
  },
  
  error: {
    ...baseColors.error,
    subtle: '#7f1d1d',    // Darker red background
  },
  
  primary: {
    ...baseColors.primary,
    subtle: '#0c4a6e',    // Darker blue background
  },
  
  // Legacy neutral colors for backward compatibility
  neutral: {
    black: '#ffffff',     // Inverted for dark theme
    gray900: '#ffffff',
    gray700: '#d1d5db',
    gray500: '#9ca3af',
    gray300: '#4b5563',
    gray100: '#374151',
    gray50: '#262626',
    white: '#0f0f0f',     // Inverted for dark theme
  },
};

// Default export (light theme for backward compatibility)
export const colors = lightColors;

// Gradient colors for avatars (auto-assigned based on initials)
export const avatarGradients = [
  ['#0891b2', '#0e7490'], // Teal
  ['#8b5cf6', '#7c3aed'], // Purple
  ['#f97316', '#ea580c'], // Orange
  ['#10b981', '#059669'], // Green
  ['#ec4899', '#be185d'], // Pink
  ['#6366f1', '#4f46e5'], // Indigo
  ['#14b8a6', '#0d9488'], // Cyan
  ['#f59e0b', '#d97706'], // Amber
];

// Function to get gradient for a name
export const getAvatarGradient = (name: string): string[] => {
  const hash = name.charCodeAt(0) + name.charCodeAt(name.length - 1);
  const index = hash % avatarGradients.length;
  return avatarGradients[index];
};

// Gift card brand colors
export const giftCardColors = {
  amazon: '#FF9900',
  target: '#CC0000',
  uberEats: '#000000',
  starbucks: '#00704A',
  doordash: '#FF3008',
  mcdonalds: '#FFC72C',
};