// User settings and preferences
export interface NotificationSettings {
  birthday_reminders: boolean;
  deals_and_sales: boolean;
  auto_send_messages: boolean;
  reminder_days_before: number; // 1, 3, or 7 days
  reminder_time: string; // HH:MM format (24-hour)
}

export interface DisplaySettings {
  dark_mode: boolean;
  theme_color: string;
  language: string;
}

export interface MessageSettings {
  default_templates: {
    friend: string;
    family: string;
    colleague: string;
  };
  auto_personalization: boolean;
  include_gift_suggestions: boolean;
}

export interface PrivacySettings {
  data_sharing: boolean;
  analytics: boolean;
  crash_reporting: boolean;
}

export interface UserSettings {
  id: string;
  user_id: string;
  notifications: NotificationSettings;
  display: DisplaySettings;
  messages: MessageSettings;
  privacy: PrivacySettings;
  updated_at: string;
  synced_at?: string;
}

export interface UserSettingsInput {
  notifications?: Partial<NotificationSettings>;
  display?: Partial<DisplaySettings>;
  messages?: Partial<MessageSettings>;
  privacy?: Partial<PrivacySettings>;
}

// Default settings for new users
export const defaultUserSettings: Omit<UserSettings, 'id' | 'user_id' | 'updated_at'> = {
  notifications: {
    birthday_reminders: true,
    deals_and_sales: false,
    auto_send_messages: false,
    reminder_days_before: 1,
    reminder_time: '09:00',
  },
  display: {
    dark_mode: false,
    theme_color: 'blue',
    language: 'en',
  },
  messages: {
    default_templates: {
      friend: '',
      family: '',
      colleague: '',
    },
    auto_personalization: true,
    include_gift_suggestions: true,
  },
  privacy: {
    data_sharing: false,
    analytics: true,
    crash_reporting: true,
  },
};