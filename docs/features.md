# Features & User Flows

## 🏠 Home Screen - Birthday Dashboard

### Layout
- **Header**: "Birthdays" title with badge showing "X this week"
- **Top Right Icons**: Calendar view, Settings/Profile button
- **Floating Action Button**: "+" in bottom right for adding birthdays

### Birthday Card Organization
Cards are grouped by time sections:
- **TODAY** - Birthdays happening today
- **[CURRENT MONTH]** - e.g., "FEBRUARY"
- **[NEXT MONTH]** - e.g., "MARCH"
- Continue for remaining months of the year

### Birthday Card Components
- **Avatar**: Initials with auto-generated gradient background
- **Name**: Person's full name
- **Age**: "Turning XX today/tomorrow/on [date]"
- **Birthday Badge**: 🎂 icon + date (e.g., "🎂 Feb 15")

### Card States & Actions

#### Today's Birthday (Green Border)
- Pre-written message preview shown
- **Primary Button**: "💬 Send Birthday Message"
- **Secondary Button**: "Send Gift"

#### Upcoming Birthday (Within 7 Days - Orange Border)
- **Primary Button**: "Plan Gift"
- **Secondary Button**: "Add Note"

#### Future Birthday (Standard Border)
- **Single Button**: "View Details"

## ➕ Add Birthday Flow

### Entry Points
- Floating "+" button on home screen
- Import from various sources during onboarding

### Form Fields
1. **Photo**: Upload circle with camera icon
2. **Name**: Required text input
3. **Birthday**: Date picker (year optional)
4. **Phone Number**: Optional (for SMS)
5. **Initial Notes**: Multi-line text area

### Data Handling
- All data saves to SQLite first
- Queues for sync when online
- Client-generated IDs for offline creation

## 👤 Contact Detail Screen

### Header Section
- Gradient/photo background (user-customizable)
- Large avatar
- Name and birthday info: "February 18 • Turning 28"
- Edit icon (top right) for customization

### Main Content: Notes & Gifts

#### Notes Section
- **Title**: "Remember"
- **Subtitle**: "Add notes to remember things about [Name] to help you find thoughtful gifts later"
- **Input**: 5 lined text inputs with examples:
  - "Example: Loves painting and watercolors"
  - "Favorite coffee: Oat milk latte"
  - "Has been wanting new running shoes"
- Auto-saves after 2 seconds of inactivity

#### Gift Section (Time-Based UI)

**7+ Days Before Birthday**
- Header: "Need help finding [Name] a gift?"
- Primary: "Generate Gift Ideas" button
- Secondary: "Quick Option: Send a Gift Card"

**1-2 Days Before Birthday**
- Header: "Running short on time?" (orange urgency)
- Gift card carousel takes prominence
- Secondary: "Generate Gift Ideas" (smaller)

**Day of Birthday**
- Header: "It's [Name]'s birthday today!" (green)
- Gift cards dominate the interface
- Minimal other options

### Settings Menu (via Edit Icon)
Access to person-specific settings:
- **Color/Photo**: Customize contact appearance
- **Notifications**: Override global settings
- **Message Template**: Custom birthday message

## 🎁 Gift Features

### AI Gift Suggestions
- **First Generation**: Free, personalized based on notes
- **Annual Reset**: Resets on person's birthday
- **Additional Suggestions**: $1 via in-app purchase
- **Results**: 5-8 personalized gift ideas with affiliate links

### Gift Card Purchase Flow
1. **Selection**: Branded cards in carousel
   - Page 1: Amazon, Target, Uber Eats
   - Page 2: McDonald's, Starbucks, DoorDash
2. **Amount Selection**: $25, $50, $100, Custom
3. **Delivery**: Email or SMS
4. **Purchase**: Secure payment processing
5. **Confirmation**: Success screen with options

## 💬 Messaging Features

### Message Templates

#### Global Templates (in Settings)
- Pre-loaded for Friend, Family, Colleague
- Optional relationship tagging
- Used when no person-specific template exists

#### Person-Specific Templates
- Set via contact's settings menu
- Overrides global templates
- Saves for future use

### One-Tap Messaging
1. Opens native messaging app
2. Pre-fills recipient and message
3. User can edit before sending
4. App tracks sent status

## 📅 Calendar Features

### Calendar View
- Month view with birthday dots
- Expandable birthday details
- Year view heat map
- Export to device calendar

### Smart Notifications
- **Week Before**: "Sarah's birthday is next week. Find a gift?"
- **Day Before**: "Tomorrow is John's birthday! 🎂"
- **Day Of**: "It's Emma's birthday today! Send wishes now"
- **After Birthday**: "Did you wish Mike happy birthday?"

## 🔄 Import Features

### Supported Sources
- Phone Contacts
- Apple Calendar
- Google Calendar
- Facebook

### Import Flow
1. **Source Selection**: Checkboxes for each source
2. **Preview List**: Separated by source with logos
3. **Duplicate Detection**: Smart matching algorithm
4. **Manual Review**: Uncheck unwanted imports
5. **Duplicate Resolution**: Merge or keep separate

### Duplicate Detection Logic
- Exact name match
- Similar names (fuzzy matching)
- Same birthday date
- Partial phone/email matches

## ⚙️ Settings & Profile

### Global Settings (via top-right button)
- **Notifications**: Default reminder preferences
- **Message Templates**: Global birthday messages
- **Theme**: Light/Dark mode toggle

### Notification Preferences
- Days before reminder (1, 3, 7 days)
- Time of day for notifications
- Weekend adjustment options

## 🔐 Privacy & Security Features

- All data encrypted locally
- Secure token storage
- No automatic cloud sync without permission
- Payment info never stored locally