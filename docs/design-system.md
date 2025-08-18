# Design System & UI Guidelines

## 🎨 Visual Identity

### Brand Personality
- **Warm**: Celebrating human connections
- **Reliable**: Never let you forget
- **Effortless**: Simple, intuitive actions
- **Thoughtful**: Helps you be a better friend

### Design Principles
1. **Clarity First**: Every element has a clear purpose
2. **Emotional Design**: Celebrate the joy of birthdays
3. **Accessibility**: Usable by everyone
4. **Performance**: Fast, smooth interactions
5. **Consistency**: Familiar patterns throughout

## 🎨 Color System

### Primary Colors
```scss
// Main brand colors
$primary-blue: #007AFF;      // Primary actions
$primary-green: #34C759;     // Success, today's birthdays
$primary-orange: #FF9500;    // Warnings, upcoming urgency

// Semantic colors
$error-red: #FF3B30;         // Errors, deletions
$warning-orange: #FF9500;    // Time-sensitive alerts
$success-green: #34C759;     // Confirmations
$info-blue: #5856D6;         // Information

// Neutral colors
$black: #000000;             // Primary text
$gray-900: #1C1C1E;          // Headers
$gray-700: #3A3A3C;          // Secondary text
$gray-500: #8E8E93;          // Placeholder text
$gray-300: #C7C7CC;          // Borders
$gray-100: #E5E5EA;          // Dividers
$gray-50: #F2F2F7;           // Backgrounds
$white: #FFFFFF;             // Cards, surfaces
```

### Gradient System
```scss
// Auto-generated avatar gradients based on initials
$gradient-1: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
$gradient-2: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
$gradient-3: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
$gradient-4: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
$gradient-5: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
$gradient-6: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
$gradient-7: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
$gradient-8: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);

// Function to select gradient based on name
function getGradient(name: string): string {
  const hash = name.charCodeAt(0) + name.charCodeAt(name.length - 1);
  const index = hash % 8;
  return gradients[index];
}
```

## 📐 Typography

### Type Scale
```scss
// Headers
$h1: 34px;    // Main screen titles
$h2: 28px;    // Section headers
$h3: 22px;    // Card titles
$h4: 20px;    // Subsection headers

// Body
$body-large: 17px;    // Primary content
$body: 15px;          // Standard text
$body-small: 13px;   // Secondary info
$caption: 11px;       // Tiny labels

// Font weights
$regular: 400;
$medium: 500;
$semibold: 600;
$bold: 700;
```

### Font Usage
- **Headers**: SF Pro Display (iOS) / Roboto (Android)
- **Body**: SF Pro Text (iOS) / Roboto (Android)
- **Monospace**: SF Mono (iOS) / Roboto Mono (Android)

## 📱 Component Library

### Birthday Card Component
```tsx
interface BirthdayCardProps {
  person: Birthday;
  variant: 'today' | 'upcoming' | 'future';
  onPress: () => void;
}

// Visual specs
const cardStyles = {
  height: 120,
  borderRadius: 12,
  padding: 16,
  marginHorizontal: 16,
  marginVertical: 8,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 3,
  borderLeftWidth: 4,
  borderLeftColor: {
    today: '#34C759',
    upcoming: '#FF9500',
    future: '#E5E5EA'
  }
};
```

### Button Component
```tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost';
  size: 'large' | 'medium' | 'small';
  onPress: () => void;
  children: React.ReactNode;
}

// Visual specs
const buttonStyles = {
  large: { height: 50, paddingHorizontal: 24, fontSize: 17 },
  medium: { height: 44, paddingHorizontal: 20, fontSize: 15 },
  small: { height: 32, paddingHorizontal: 16, fontSize: 13 }
};
```

### Avatar Component
```tsx
interface AvatarProps {
  name: string;
  size: 'large' | 'medium' | 'small';
  imageUrl?: string;
  color?: string;
}

// Visual specs
const avatarSizes = {
  large: 80,   // Profile screens
  medium: 48,  // Cards
  small: 32    // Lists
};
```

### Input Component
```tsx
interface InputProps {
  label?: string;
  placeholder?: string;
  multiline?: boolean;
  lines?: number;
}

// Visual specs
const inputStyles = {
  height: 44,
  borderRadius: 8,
  paddingHorizontal: 12,
  fontSize: 17,
  borderWidth: 1,
  borderColor: '#C7C7CC'
};
```

## 🎯 Icon System

### Icon Library
Using SF Symbols (iOS) and Material Icons (Android) for consistency:

```tsx
// Navigation icons
<Icon name="calendar" size={24} />
<Icon name="settings" size={24} />
<Icon name="add" size={24} />

// Action icons
<Icon name="gift" size={20} />
<Icon name="message" size={20} />
<Icon name="edit" size={20} />

// Status icons
<Icon name="check-circle" size={16} color="green" />
<Icon name="sync" size={16} color="orange" />
<Icon name="error" size={16} color="red" />
```

## 📏 Spacing System

### Base Unit: 4px
```scss
$space-xs: 4px;    // Tight spacing
$space-sm: 8px;    // Small elements
$space-md: 16px;   // Standard spacing
$space-lg: 24px;   // Section spacing
$space-xl: 32px;   // Large sections
$space-xxl: 48px;  // Major sections
```

### Layout Grid
- **Columns**: 4 column grid on mobile
- **Margins**: 16px standard
- **Gutters**: 8px between elements

## 🎭 Animation Guidelines

### Timing Functions
```scss
$ease-in-out: cubic-bezier(0.42, 0, 0.58, 1);
$ease-out: cubic-bezier(0.25, 0.46, 0.45, 0.94);
$spring: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Duration Standards
- **Instant**: 100ms (micro-interactions)
- **Fast**: 200ms (small transitions)
- **Normal**: 300ms (standard animations)
- **Slow**: 500ms (complex transitions)

### Common Animations
```tsx
// Button press
Animated.spring(scale, {
  toValue: 0.95,
  duration: 100,
  useNativeDriver: true
});

// Card appear
Animated.timing(opacity, {
  toValue: 1,
  duration: 300,
  easing: Easing.out(Easing.quad)
});

// Sync spinner
Animated.loop(
  Animated.timing(rotation, {
    toValue: 1,
    duration: 1000,
    easing: Easing.linear
  })
);
```

## 🌓 Theme System

### Light Theme (Default)
```tsx
const lightTheme = {
  background: '#F2F2F7',
  surface: '#FFFFFF',
  primary: '#007AFF',
  text: '#000000',
  textSecondary: '#8E8E93',
  border: '#E5E5EA'
};
```

### Dark Theme
```tsx
const darkTheme = {
  background: '#000000',
  surface: '#1C1C1E',
  primary: '#0A84FF',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  border: '#3A3A3C'
};
```

## 📱 Responsive Design

### Breakpoints
```tsx
const breakpoints = {
  small: 320,   // iPhone SE
  medium: 375,  // iPhone 12/13
  large: 414,   // iPhone Plus
  xlarge: 768   // iPad
};
```

### Adaptive Layouts
- **Cards**: 1 column on phones, 2 on tablets
- **Gift carousel**: 3 items on phones, 5 on tablets
- **Font scaling**: Respect system accessibility settings

## ♿ Accessibility Guidelines

### Requirements
- **Color Contrast**: WCAG AA minimum (4.5:1)
- **Touch Targets**: Minimum 44x44 points
- **Labels**: All interactive elements labeled
- **VoiceOver/TalkBack**: Full support

### Implementation
```tsx
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Send birthday message to Sarah"
  accessibilityRole="button"
  accessibilityHint="Opens messaging app with pre-written message"
>
  <Text>Send Message</Text>
</TouchableOpacity>
```

## 🎪 Special States

### Empty States
- Friendly illustration
- Clear explanation
- Action button to resolve

### Loading States
- Skeleton screens for content
- Progress indicators for actions
- Subtle animations

### Error States
- Clear error message
- Suggested action
- Retry capability

### Offline States
- Orange indicator
- Explanation text
- Queue visualization

## 📐 Example Layouts

### Home Screen Layout
```
┌─────────────────────────┐
│ Status Bar (System)     │ 
├─────────────────────────┤
│ Header (64px)           │
│ ┌─────┬─────────┬─────┐ │
│ │Logo │Birthdays│Icons│ │
│ └─────┴─────────┴─────┘ │
├─────────────────────────┤
│ Section Header (40px)   │
│ TODAY                   │
├─────────────────────────┤
│ Card (120px)           │
│ ┌───┬───────────┬─────┐ │
│ │Avt│  Content   │Badge│ │
│ │   │  Buttons   │     │ │
│ └───┴───────────┴─────┘ │
├─────────────────────────┤
│         ...             │
└─────────────────────────┘
         [FAB]
```

### Time-Based Gift UI
```
Standard (7+ days):
┌─────────────────────────┐
│    Generate Ideas       │ Primary
├─────────────────────────┤
│         or             │
├─────────────────────────┤
│   Send Gift Card       │ Secondary
└─────────────────────────┘

Urgent (1-2 days):
┌─────────────────────────┐
│    Gift Card Carousel   │ Primary
├─────────────────────────┤
│    Browse More         │
├─────────────────────────┤
│   Generate Ideas       │ Small
└─────────────────────────┘
```