export const colors = {
  // Primary colors
  primary: {
    main: '#0891b2',      // Primary blue
    dark: '#0e7490',
    light: '#06b6d4',
    subtle: '#f0f9ff',
  },
  
  // Semantic colors
  success: {
    main: '#10b981',      // Green for today's birthdays
    dark: '#059669',
    light: '#34d399',
    subtle: '#d1fae5',
  },
  
  warning: {
    main: '#f97316',      // Orange for upcoming urgency
    dark: '#ea580c',
    light: '#fb923c',
    subtle: '#fed7aa',
  },
  
  error: {
    main: '#ef4444',
    dark: '#dc2626',
    light: '#f87171',
    subtle: '#fee2e2',
  },
  
  // Neutral colors
  neutral: {
    black: '#000000',
    gray900: '#1a1d23',    // Primary text
    gray700: '#374151',    // Secondary text  
    gray500: '#64748b',    // Placeholder text
    gray300: '#cbd5e1',    // Borders
    gray100: '#e2e8f0',    // Dividers
    gray50: '#f8fafc',     // Backgrounds
    white: '#ffffff',
  },
  
  // Background colors
  background: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
  },
  
  // Border colors
  border: {
    light: '#e2e8f0',
    medium: '#cbd5e1',
    focus: '#0891b2',
  },
};

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