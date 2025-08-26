import { Birthday } from '@/types';

export const mockBirthdays: Birthday[] = [
  {
    id: '1',
    name: 'John Doe',
    date: '1992-08-18', // Today
    notes: '',
    updated_at: new Date().toISOString(),
    metadata: {
      relationship: 'friend',
      themeColorId: '1',
    },
  },
  {
    id: '2',
    name: 'Sarah Smith',
    date: '1996-08-21', // 3 days from now
    notes: 'Loves painting and watercolors',
    updated_at: new Date().toISOString(),
    metadata: {
      relationship: 'family',
      themeColorId: '2',
    },
  },
  {
    id: '3',
    name: 'Mike Johnson',
    date: '1979-09-05', // Next month
    notes: 'Coffee enthusiast',
    updated_at: new Date().toISOString(),
    metadata: {
      relationship: 'colleague',
      themeColorId: '3',
    },
  },
  {
    id: '4',
    name: 'Emma Wilson',
    date: '2001-08-25', // This week
    notes: 'Studying computer science',
    updated_at: new Date().toISOString(),
    metadata: {
      relationship: 'friend',
      themeColorId: '4',
    },
  },
  {
    id: '5',
    name: 'David Brown',
    date: '1988-10-12', // October
    notes: 'Plays guitar in a band',
    updated_at: new Date().toISOString(),
    metadata: {
      relationship: 'friend',
      themeColorId: '5',
    },
  },
  {
    id: '6',
    name: 'Lisa Anderson',
    date: '1995-11-20', // November
    notes: 'Yoga instructor',
    updated_at: new Date().toISOString(),
    metadata: {
      relationship: 'family',
      themeColorId: '6',
    },
  },
  {
    id: '7',
    name: 'Tom Martinez',
    date: '1990-08-20', // This week
    notes: 'Basketball player',
    updated_at: new Date().toISOString(),
    metadata: {
      relationship: 'colleague',
      themeColorId: '7',
    },
  },
];