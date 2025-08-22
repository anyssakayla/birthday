import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

import BirthdayCard from '@components/cards/BirthdayCard';
import { theme } from '@/theme';
import { useBirthdayStore } from '@/stores';
// import { database } from '@/database';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { BirthdayWithSync } from '@/types';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

// Helper to get days until birthday
const getDaysUntilBirthday = (date: string): number => {
  const today = new Date();
  const birthday = new Date(date);
  birthday.setFullYear(today.getFullYear());
  
  if (birthday < today) {
    birthday.setFullYear(today.getFullYear() + 1);
  }
  
  const diffTime = birthday.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Helper to categorize birthdays
const categorizeBirthdays = (birthdays: BirthdayWithSync[]) => {
  const today: BirthdayWithSync[] = [];
  const thisMonth: BirthdayWithSync[] = [];
  const nextMonth: BirthdayWithSync[] = [];
  const later: Map<string, BirthdayWithSync[]> = new Map();
  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  birthdays.forEach((birthday) => {
    const daysUntil = getDaysUntilBirthday(birthday.date);
    const birthdayDate = new Date(birthday.date);
    birthdayDate.setFullYear(currentYear);
    
    if (daysUntil === 0) {
      today.push(birthday);
    } else if (birthdayDate.getMonth() === currentMonth) {
      thisMonth.push(birthday);
    } else if (birthdayDate.getMonth() === (currentMonth + 1) % 12) {
      nextMonth.push(birthday);
    } else {
      const monthKey = format(birthdayDate, 'MMMM');
      if (!later.has(monthKey)) {
        later.set(monthKey, []);
      }
      later.get(monthKey)!.push(birthday);
    }
  });
  
  return { today, thisMonth, nextMonth, later };
};

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { birthdays, loadBirthdays } = useBirthdayStore();
  
  useEffect(() => {
    // Initialize database and load birthdays
    const initializeData = async () => {
      // await database.init();
      await loadBirthdays();
    };
    
    initializeData();
  }, []);
  
  const categorized = categorizeBirthdays(birthdays);
  const thisWeekCount = birthdays.filter(b => {
    const days = getDaysUntilBirthday(b.date);
    return days >= 0 && days <= 7;
  }).length;
  
  console.log('This week count:', thisWeekCount);
  console.log('Birthdays:', birthdays.map(b => ({ name: b.name, date: b.date, days: getDaysUntilBirthday(b.date) })));
  
  const currentMonthName = format(new Date(), 'MMMM');
  const nextMonthName = format(new Date(new Date().setMonth(new Date().getMonth() + 1)), 'MMMM');
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Birthdays</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => navigation.navigate('Calendar')}
              >
                <Ionicons name="calendar-outline" size={24} color={theme.colors.neutral.gray700} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => navigation.navigate('Settings')}
              >
                <Ionicons name="person-circle-outline" size={24} color={theme.colors.neutral.gray700} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.quickStats}>
            <View style={styles.statBadge}>
              <Text style={styles.statItem}>
                <Text style={styles.statNumber}>{thisWeekCount}</Text> this week
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
      
      {/* Birthday List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Today's Birthdays */}
        {categorized.today.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>TODAY</Text>
            {categorized.today.map((birthday) => (
              <BirthdayCard 
                key={birthday.id} 
                birthday={birthday} 
                variant="today"
              />
            ))}
          </>
        )}
        
        {/* This Month */}
        {categorized.thisMonth.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>{currentMonthName.toUpperCase()}</Text>
            {categorized.thisMonth.map((birthday) => {
              const daysUntil = getDaysUntilBirthday(birthday.date);
              return (
                <BirthdayCard 
                  key={birthday.id} 
                  birthday={birthday} 
                  variant={daysUntil <= 7 ? 'upcoming' : 'future'}
                />
              );
            })}
          </>
        )}
        
        {/* Next Month */}
        {categorized.nextMonth.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>{nextMonthName.toUpperCase()}</Text>
            {categorized.nextMonth.map((birthday) => (
              <BirthdayCard 
                key={birthday.id} 
                birthday={birthday} 
                variant="future"
              />
            ))}
          </>
        )}
        
        {/* Later Months */}
        {Array.from(categorized.later.entries()).map(([month, birthdays]) => (
          <React.Fragment key={month}>
            <Text style={styles.sectionHeader}>{month.toUpperCase()}</Text>
            {birthdays.map((birthday) => (
              <BirthdayCard 
                key={birthday.id} 
                birthday={birthday} 
                variant="future"
              />
            ))}
          </React.Fragment>
        ))}
        
        {/* Empty State */}
        {birthdays.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No birthdays yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Tap the + button to add your first birthday
            </Text>
          </View>
        )}
        
        <View style={{ height: 100 }} />
      </ScrollView>
      
      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('AddBirthday')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color={theme.colors.neutral.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfc',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#0ea5e9',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statBadge: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statItem: {
    fontSize: 14,
    color: '#64748b',
  },
  statNumber: {
    fontWeight: '600',
    color: '#0891b2',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyStateText: {
    fontSize: theme.typography.fontSize.large,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.neutral.gray700,
    marginBottom: theme.spacing.sm,
  },
  emptyStateSubtext: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.neutral.gray500,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 64,
    height: 64,
    backgroundColor: '#0ea5e9',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.large,
  },
});