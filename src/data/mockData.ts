import { Birthday } from '@/types';

export const mockBirthdays: Birthday[] = [
  {
    id: '1',
    name: 'John Doe',
    date: '1992-08-18', // Today
    phone: '+1234567890',
    notes: 'Loves hiking and outdoor activities',
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Sarah Smith',
    date: '1996-08-21', // 3 days from now
    phone: '+0987654321',
    notes: 'Loves painting and watercolors',
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Mike Johnson',
    date: '1979-09-05', // Next month
    phone: '+1122334455',
    notes: 'Coffee enthusiast',
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Emma Wilson',
    date: '2001-08-25', // This week
    notes: 'Studying computer science',
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'David Brown',
    date: '1988-10-12', // October
    phone: '+5544332211',
    notes: 'Plays guitar in a band',
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Lisa Anderson',
    date: '1995-11-20', // November
    notes: 'Yoga instructor',
    updated_at: new Date().toISOString(),
  },
  {
    id: '7',
    name: 'Tom Martinez',
    date: '1990-08-20', // This week
    phone: '+9988776655',
    notes: 'Basketball player',
    updated_at: new Date().toISOString(),
  },
];