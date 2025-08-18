# Implementation Notes & Clarifications

This document contains specific implementation details and clarifications based on project requirements.

## 🎨 UI Implementation Details

### Contact Detail Screen Navigation
- **No tabs** - Use a settings/edit icon in the top right corner instead
- Clicking the edit icon opens options for:
  - Color/Photo customization
  - Notification preferences (override global)
  - Message template (person-specific)

### Profile/Settings Structure
- **Top-right corner** shows a settings icon (not profile for now)
- Opens to a simple settings page with:
  - Global notification preferences
  - Global message templates
  - Light/Dark mode toggle
- Future: Can expand to full profile with user info

### Birthday Import UI
- **Separated by source** with branded headers:
  - Facebook logo and styling for Facebook imports
  - Apple Calendar icon for Calendar imports
  - Google Calendar branding for Google imports
  - Contacts app icon for phone contacts
- **Missing year handling**: Subtle visual indicator but not intrusive
- **Duplicate handling**: 
  - Smart detection algorithm
  - Modal with checkboxes to resolve
  - "Keep both" or "Merge" options

## 💬 Message Template System

### Template Categories
- Templates can be tagged as: Friend, Family, Colleague
- Tags are **optional** - users don't have to categorize
- If tagged, templates only apply to contacts with matching tags
- One-sentence explanation in UI about benefits

### Template Hierarchy
1. **Person-specific template** (highest priority)
2. **Category template** (if contact is tagged)
3. **Global template** (fallback)

### Template UI Copy
"Tag your templates by relationship type to send more personalized messages automatically"

## 🎁 AI Gift Suggestions

### Pricing Model
- **First suggestion**: Free (5-8 personalized ideas)
- **Additional suggestions**: $1 each via in-app purchase
- **Annual reset**: Resets on each person's birthday
- **Messaging**: Positive framing - "Get more personalized gift ideas for just $1"

### User Communication
Instead of: "Only one gift suggestion allowed per year"
Use: "Your personalized suggestions refresh every year on [Name]'s birthday. Want more ideas now? Get a fresh set for just $1!"

## 🎨 Avatar Colors

### Auto-Generation Logic
```typescript
function getAvatarColor(name: string): string {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    // ... more gradients
  ];
  
  const hash = name.charCodeAt(0) + name.charCodeAt(name.length - 1);
  return gradients[hash % gradients.length];
}
```

### Customization
- Users can override auto-color via edit icon
- Can choose solid color or upload photo
- Preference saved per contact

## 🔄 Sync Status Messaging

### User-Friendly Language
Instead of technical sync terms, use:
- "Waiting for network connection" (not "Sync pending")
- "Saving your changes..." (during sync)
- "All changes saved" (when synced)
- "Working offline - changes will save when connected"

## 📱 Onboarding Flow

### Import Sources Priority
1. Show all available sources with checkboxes
2. Pre-check the most common (Contacts)
3. Let users uncheck sources they don't want

### Import Preview
- Show combined count: "Found 47 birthdays to import"
- Separate sections by source with visual headers
- Quick "uncheck all from this source" option
- Highlight potential duplicates

### Duplicate Resolution
1. **Detection Algorithm**:
   - Exact name match
   - Fuzzy name matching (John Smith vs John S.)
   - Same birthday date
   - Partial contact info match

2. **UI Presentation**:
   - "We found possible duplicates"
   - Show both entries side by side
   - Source icons to identify where each came from
   - Checkbox options: "Merge" or "Keep both"

## 🎯 Time-Based UI Implementation

### Day Calculation
```typescript
function getDaysUntilBirthday(birthday: Date): number {
  const today = new Date();
  const thisYear = today.getFullYear();
  
  // Create birthday date for this year
  let birthdayThisYear = new Date(birthday);
  birthdayThisYear.setFullYear(thisYear);
  
  // If birthday passed this year, calculate for next year
  if (birthdayThisYear < today) {
    birthdayThisYear.setFullYear(thisYear + 1);
  }
  
  // Calculate days difference
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.ceil((birthdayThisYear - today) / msPerDay);
}
```

### UI State Selection
```typescript
function getGiftUIState(daysUntil: number): 'standard' | 'urgent' | 'today' {
  if (daysUntil === 0) return 'today';
  if (daysUntil <= 2) return 'urgent';
  return 'standard';
}
```

## 🏗️ Development Phases

### Phase 1: MVP Features
1. Basic birthday tracking
2. Simple reminders
3. One-tap messaging
4. Manual gift card links

### Phase 2: Enhanced Features
1. AI gift suggestions
2. Integrated gift card API
3. Import from multiple sources
4. Sync infrastructure

### Phase 3: Premium Features
1. Additional AI suggestions ($1)
2. Advanced customization
3. Analytics and insights
4. Business features (future)