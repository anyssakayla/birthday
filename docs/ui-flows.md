# UI/UX Flows & Screen Designs

## 🎨 Design Principles

1. **Time-Aware Interface**: UI adapts based on birthday proximity
2. **Minimal Friction**: One-tap actions for common tasks
3. **Visual Hierarchy**: Critical actions always prominent
4. **Offline-First**: Never block actions due to network

## 📱 Screen Inventory

### Primary Screens
1. **Home** - Birthday dashboard
2. **Add Birthday** - New contact form
3. **Contact Detail** - Person's info, notes, gifts
4. **Calendar View** - Month/year calendar
5. **Settings** - Global preferences
6. **Import Birthdays** - Onboarding/import flow

### Modal/Secondary Screens
- Gift Card Selection
- Gift Ideas Results
- Payment Flow
- Message Template Editor
- Contact Edit (color/photo)

## 🔄 Navigation Flow

```
Home Screen
├── Add Birthday (+)
│   └── Save → Home
├── Birthday Card (tap)
│   ├── Notes & Gifts
│   └── Edit Icon → Settings
│       ├── Color/Photo
│       ├── Notifications
│       └── Message Template
├── Calendar Icon
│   └── Calendar View
└── Settings Icon
    ├── Notifications
    ├── Message Templates
    └── Theme Toggle
```

## 🎯 Time-Based UI Logic

### Implementation Code Structure
```typescript
interface GiftSectionProps {
  daysUntilBirthday: number;
  personName: string;
}

const GiftSection: React.FC<GiftSectionProps> = ({ daysUntilBirthday, personName }) => {
  if (daysUntilBirthday === 0) {
    return <DayOfBirthdayUI />;  // Gift cards prominent
  } else if (daysUntilBirthday <= 2) {
    return <LastMinuteUI />;     // Gift cards first
  } else {
    return <StandardUI />;        // Ideas first
  }
};
```

### UI States by Timeline

#### Standard State (7+ Days)
```
┌─────────────────────────┐
│ Need help finding       │
│ [Name] a gift?         │
│                        │
│ ┌───────────────────┐  │
│ │ Generate Gift     │  │ ← Primary (Blue)
│ │     Ideas         │  │
│ └───────────────────┘  │
│         or             │
│ ┌───────────────────┐  │
│ │ Send a Gift Card │  │ ← Secondary (Outline)
│ └───────────────────┘  │
└─────────────────────────┘
```

#### Urgent State (1-2 Days)
```
┌─────────────────────────┐
│ Running short on time?  │ ← Orange text
│                        │
│ ┌─────┬─────┬─────┐   │
│ │ $50 │ $25 │ $30 │   │ ← Carousel
│ │Amzn │Trgt │Uber │   │
│ └─────┴─────┴─────┘   │
│      • • ○             │
│                        │
│ [Browse More Cards]    │
│ ─────────────────────  │
│ or create personalized │
│ [Generate Ideas]       │ ← Small button
└─────────────────────────┘
```

#### Birthday Day State
```
┌─────────────────────────┐
│ It's [Name]'s          │ ← Green text
│ birthday today! 🎉     │
│                        │
│ ┌─────┬─────┬─────┐   │
│ │ $50 │ $25 │ $30 │   │ ← Large carousel
│ │Amzn │Trgt │Uber │   │
│ └─────┴─────┴─────┘   │
│      • • ○             │
│                        │
│ ┌───────────────────┐  │
│ │ Browse More       │  │ ← Primary action
│ │   Gift Cards      │  │
│ └───────────────────┘  │
│                        │
│ [Other gift ideas]     │ ← Tiny link
└─────────────────────────┘
```

## 🎨 Visual Design System

### Color Palette
- **Primary**: Blue (#007AFF) - Main actions
- **Success**: Green (#34C759) - Today's birthdays
- **Warning**: Orange (#FF9500) - Upcoming urgency
- **Background**: Light gray (#F2F2F7)
- **Card Background**: White (#FFFFFF)
- **Text Primary**: Black (#000000)
- **Text Secondary**: Gray (#8E8E93)

### Typography
- **Headers**: SF Pro Display, 28pt, Bold
- **Card Titles**: SF Pro Text, 17pt, Semibold
- **Body**: SF Pro Text, 15pt, Regular
- **Buttons**: SF Pro Text, 17pt, Medium
- **Small Text**: SF Pro Text, 13pt, Regular

### Component Specs

#### Birthday Card
- **Height**: 120px
- **Margin**: 16px horizontal, 8px vertical
- **Border Radius**: 12px
- **Shadow**: 0 2px 8px rgba(0,0,0,0.1)
- **Border Width**: 4px (left side only)

#### Avatar
- **Size**: 48x48px
- **Font Size**: 20px (initials)
- **Background**: Auto-generated gradient
- **Border Radius**: 50%

#### Buttons
- **Height**: 44px
- **Border Radius**: 8px
- **Padding**: 16px horizontal
- **Font**: 17px Medium

## 🎬 Animations & Transitions

### Screen Transitions
- **Push Navigation**: Slide from right (iOS standard)
- **Modal Presentation**: Slide up from bottom
- **Tab Switches**: Cross-fade

### Micro-Interactions
- **Button Press**: Scale to 0.95 with opacity 0.8
- **Card Tap**: Subtle shadow increase
- **Pull to Refresh**: Standard iOS bounce
- **Loading States**: Skeleton screens

### Sync Indicators
- **Syncing**: Rotating circle animation
- **Offline**: Pulsing orange dot
- **Synced**: Static green checkmark

## 📐 Layout Specifications

### Home Screen Grid
```
┌─────────────────────────┐
│ Status Bar              │ 44px
├─────────────────────────┤
│ Header                  │ 64px
│ [Birthdays] [3] [📅][⚙️]│
├─────────────────────────┤
│                         │
│ TODAY                   │ Section Header
│ ┌─────────────────┐    │
│ │ Birthday Card   │    │ 120px
│ └─────────────────┘    │
│                         │
│ FEBRUARY               │
│ ┌─────────────────┐    │
│ │ Birthday Card   │    │
│ └─────────────────┘    │
│                         │ Scrollable
│         ...            │
│                         │
│              [+]       │ FAB
└─────────────────────────┘
```

### Contact Detail Layout
```
┌─────────────────────────┐
│ Gradient Header         │ 200px
│    [Avatar]            │
│    John Smith          │
│    Feb 18 • Turning 28 │
│                    [✏️] │
├─────────────────────────┤
│                         │
│ Remember               │
│ ___________________    │
│ ___________________    │
│ ___________________    │ Scrollable
│                         │
│ ─────────────────────  │
│                         │
│ [Gift Section]         │ Time-based
│                         │
└─────────────────────────┘
```

## 🔀 User Flow Examples

### First-Time User Flow
1. **Onboarding** → Import sources selection
2. **Import Preview** → Review and deselect
3. **Duplicate Check** → Resolve conflicts
4. **Home Screen** → See all birthdays
5. **First Birthday** → Guided tour

### Returning User Daily Flow
1. **Open App** → See today's birthdays
2. **Tap Card** → View pre-written message
3. **Send Message** → One tap to SMS
4. **Mark Complete** → Update UI
5. **Plan Next** → Browse upcoming

### Gift Purchase Flow
1. **View Contact** → See gift section
2. **Select Card** → From carousel
3. **Choose Amount** → Preset options
4. **Add Message** → Optional
5. **Purchase** → Apple Pay
6. **Confirmation** → Success screen