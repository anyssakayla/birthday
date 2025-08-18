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
        
        <Text style={styles.weekBadge}>
          <Text style={styles.weekBadgeNumber}>{thisWeekCount || 3}</Text> this week
        </Text>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: theme.colors.background.primary,
    paddingHorizontal: theme.componentSpacing.screen.paddingHorizontal,
    paddingBottom: theme.spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: 36,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary.main,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  iconButton: {
    width: 44,
    height: 44,
    backgroundColor: '#f0f0f0',
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekBadge: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: theme.spacing.sm,
    paddingLeft: 2,
  },
  weekBadgeNumber: {
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary.main,
    fontSize: 18,
  },
  content: {
    flex: 1,
    paddingTop: theme.spacing.md,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#6B7280',
    letterSpacing: 0.5,
    paddingHorizontal: theme.componentSpacing.screen.paddingHorizontal,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
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
    backgroundColor: theme.colors.primary.main,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.large,
  },
});