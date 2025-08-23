import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MessageTemplate {
  id: string;
  category: 'friend' | 'family' | 'colleague';
  title: string;
  icon: string;
  message: string;
}

interface TemplateStore {
  templates: MessageTemplate[];
  loadTemplates: () => Promise<void>;
  updateTemplate: (id: string, message: string) => Promise<void>;
  resetTemplates: () => Promise<void>;
}

const defaultTemplates: MessageTemplate[] = [
  {
    id: 'friend',
    category: 'friend',
    title: 'Friend',
    icon: '👥',
    message: `Happy Birthday, {name}! 🎉

Hope your special day is filled with lots of love, laughter, and all your favorite things. Here's to another year of amazing memories together!

Cheers to you! 🥳`,
  },
  {
    id: 'family',
    category: 'family',
    title: 'Family',
    icon: '👨‍👩‍👧',
    message: `Dear {name}, 🎂

Wishing you a wonderful birthday filled with joy and happiness. May this year bring you good health, success, and countless blessings.

With love from your family ❤️`,
  },
  {
    id: 'colleague',
    category: 'colleague',
    title: 'Colleague',
    icon: '💼',
    message: `Happy Birthday, {name}!

Wishing you a fantastic day and a year ahead filled with success and new opportunities. Hope you enjoy your special day!

Best wishes from the team 🎊`,
  },
];

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  templates: defaultTemplates,

  loadTemplates: async () => {
    try {
      const stored = await AsyncStorage.getItem('messageTemplates');
      if (stored) {
        set({ templates: JSON.parse(stored) });
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  },

  updateTemplate: async (id: string, message: string) => {
    const { templates } = get();
    const updated = templates.map((template) =>
      template.id === id ? { ...template, message } : template
    );
    
    set({ templates: updated });
    
    try {
      await AsyncStorage.setItem('messageTemplates', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving template:', error);
    }
  },

  resetTemplates: async () => {
    set({ templates: defaultTemplates });
    try {
      await AsyncStorage.removeItem('messageTemplates');
    } catch (error) {
      console.error('Error resetting templates:', error);
    }
  },
}));