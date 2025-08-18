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
  
  const currentMonthName = format(new Date(), 'MMMM').toUpperCase();
  const nextMonthName = format(new Date(new Date().setMonth(new Date().getMonth() + 1)), 'MMMM').toUpperCase();
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
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
        
        {thisWeekCount > 0 && (
          <View style={styles.weekBadge}>
            <Text style={styles.weekBadgeText}>
              <Text style={styles.weekBadgeNumber}>{thisWeekCount}</Text> this week
            </Text>
          </View>
        )}
      </View>
      
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
            <Text style={styles.sectionHeader}>{currentMonthName}</Text>
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
            <Text style={styles.sectionHeader}>{nextMonthName}</Text>
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
        <Ionicons name="add" size={28} color={theme.colors.neutral.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  header: {
    backgroundColor: theme.colors.background.primary,
    paddingHorizontal: theme.componentSpacing.screen.paddingHorizontal,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 32,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary.main,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekBadge: {
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.extraLarge,
    alignSelf: 'flex-start',
  },
  weekBadgeText: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.neutral.gray500,
  },
  weekBadgeNumber: {
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary.main,
  },
  content: {
    flex: 1,
    paddingTop: theme.spacing.md,
  },
  sectionHeader: {
    ...theme.textStyles.sectionHeader,
    color: theme.colors.neutral.gray500,
    paddingHorizontal: theme.componentSpacing.screen.paddingHorizontal,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
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
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.large,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.large,
  },
});