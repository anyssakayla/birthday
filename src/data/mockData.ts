import { Birthday } from '@/types';

export const mockBirthdays: Birthday[] = [
  {
    id: '1',
    name: 'John Doe',
    date: '1992-02-15', // Today (adjust based on current date)
    phone: '+1234567890',
    notes: 'Loves hiking and outdoor activities',
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Sarah Smith',
    date: '1996-02-18', // 3 days from now
    phone: '+0987654321',
    notes: 'Loves painting and watercolors',
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Mike Johnson',
    date: '1979-03-05',
    phone: '+1122334455',
    notes: 'Coffee enthusiast',
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Emma Wilson',
    date: '2001-02-25',
    notes: 'Studying computer science',
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'David Brown',
    date: '1988-04-12',
    phone: '+5544332211',
    notes: 'Plays guitar in a band',
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Lisa Anderson',
    date: '1995-05-20',
    notes: 'Yoga instructor',
    updated_at: new Date().toISOString(),
  },
  {
    id: '7',
    name: 'Tom Martinez',
    date: '1990-02-20', // This week
    phone: '+9988776655',
    notes: 'Basketball player',
    updated_at: new Date().toISOString(),
  },
];