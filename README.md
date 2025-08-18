# Birthday Reminder App

A local-first birthday reminder app that helps users never miss a birthday and makes gift-giving effortless through smart reminders, one-tap messaging, and integrated gift card purchases.

## 🎯 Core Value Proposition

- **Never Forget**: Smart notifications ensure you never miss a birthday
- **Effortless Gifting**: AI-powered gift suggestions and instant gift card delivery
- **One-Tap Messages**: Pre-written birthday messages ready to send
- **Works Offline**: All features work without internet, syncs when connected

## 📱 Key Features

1. **Smart Birthday Dashboard**: Time-based UI that adapts as birthdays approach
2. **Gift Intelligence**: AI-powered gift suggestions based on personal notes
3. **Instant Gift Cards**: Purchase and send gift cards directly from the app
4. **Message Templates**: Customizable birthday messages per person or globally
5. **Multi-Source Import**: Import birthdays from Contacts, Apple Calendar, Google Calendar, and Facebook
6. **Offline-First**: Everything works offline with automatic sync

## 🛠 Tech Stack

- **Frontend**: React Native + Expo
- **State Management**: Zustand
- **Local Database**: SQLite (expo-sqlite)
- **Cloud Database**: Supabase (PostgreSQL)
- **Backend**: CloudFlare Workers
- **Storage**: CloudFlare R2 (images)
- **UI Components**: React Native Paper (Material Design)
- **Navigation**: React Navigation

## 📖 Documentation

- [Features & User Flows](./docs/features.md) - Detailed feature specifications
- [UI/UX Flows](./docs/ui-flows.md) - Screen designs and navigation
- [Technical Architecture](./docs/technical-architecture.md) - Backend, sync, and data models
- [Revenue Model](./docs/revenue-model.md) - Monetization strategy
- [Design System](./docs/design-system.md) - UI components and styling guidelines

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## 📁 Project Structure

```
birthday/
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # App screens
│   ├── database/        # SQLite setup and migrations
│   ├── types/           # TypeScript interfaces
│   ├── utils/           # Helper functions
│   ├── stores/          # Zustand state management
│   └── services/        # API and sync services
├── docs/                # Project documentation
└── assets/              # Images and static files
```

## 🔐 Privacy & Security

- All data stored locally first
- Secure credential storage for tokens
- No data leaves device without user consent
- Gift card transactions use secure payment processing

## 💰 Revenue Streams

1. **Gift Card Commissions**: 3-5% on all gift card purchases
2. **Affiliate Links**: 4-10% on gift suggestions
3. **Premium Features**: $1 for additional AI gift suggestions per person/year

## 🎨 Design Philosophy

- **Time-Aware UI**: Interface adapts based on birthday proximity
- **Minimal Friction**: One-tap actions for common tasks
- **Visual Hierarchy**: Important actions are always prominent
- **Offline-First**: Never block user actions due to network

## 📱 Core User Journey

1. **Import Birthdays** → 2. **Add Notes** → 3. **Get Reminders** → 4. **Send Gift/Message** → 5. **Track & Improve**

---

Built with ❤️ to make birthdays special