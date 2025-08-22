import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { format } from 'date-fns';

import Avatar from '@components/ui/Avatar';
import { theme } from '@/theme';
import { Birthday } from '@/types';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { getThemeColor } from '@/utils/themeColors';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface BirthdayCardProps {
  birthday: Birthday;
  variant: 'today' | 'upcoming' | 'future';
  onPress?: () => void;
}

// Helper to calculate age
const calculateAge = (birthDate: string): number => {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

export default function BirthdayCard({ birthday, variant, onPress }: BirthdayCardProps) {
  const navigation = useNavigation<NavigationProp>();
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate('BirthdayDetail', { birthdayId: birthday.id });
    }
  };
  
  const age = calculateAge(birthday.date);
  const birthDate = new Date(birthday.date);
  const formattedDate = format(birthDate, 'MMM d');
  
  // Get border color based on variant
  const getBorderColor = () => {
    switch (variant) {
      case 'today':
        return theme.colors.success.main;
      case 'upcoming':
        return theme.colors.warning.main;
      default:
        return theme.colors.border.light;
    }
  };
  
  // Get age text based on variant
  const getAgeText = () => {
    switch (variant) {
      case 'today':
        return `Turning ${age} today`;
      default:
        return `Turning ${age}`;
    }
  };
  
  return (
    <Pressable 
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        { borderLeftColor: getBorderColor() },
        pressed && styles.pressed,
      ]}
    >
      {/* Birthday Badge */}
      <View style={styles.birthdayBadge}>
        <Ionicons name="gift-outline" size={16} color="#0891b2" />
        <Text style={styles.badgeText}>{formattedDate}</Text>
      </View>
      
      {/* Card Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Avatar 
            name={birthday.name} 
            size="medium" 
            customColors={getThemeColor(birthday.metadata?.themeColorId).gradient}
          />
          <View style={styles.info}>
            <Text style={styles.name}>{birthday.name}</Text>
            <Text style={styles.meta}>{getAgeText()}</Text>
          </View>
        </View>
        
        {/* Message Preview for Today's Birthdays */}
        {variant === 'today' && (
          <View style={styles.messagePreview}>
            <Text style={styles.messageLabel}>Ready to send:</Text>
            <Text style={styles.messageText}>
              "Happy birthday {birthday.name.split(' ')[0]}! 🎉 Hope you have a great day!"
            </Text>
            <TouchableOpacity>
              <Text style={styles.editMessage}>Edit message</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Action Buttons */}
        <View style={styles.actions}>
          {variant === 'today' && (
            <>
              <TouchableOpacity style={[styles.button, styles.primaryButton]}>
                <Text style={styles.messageIcon}>💬</Text>
                <Text style={styles.primaryButtonText}>Send Birthday Message</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.secondaryButton]}>
                <Text style={styles.secondaryButtonText}>Send Gift</Text>
              </TouchableOpacity>
            </>
          )}
          
          {variant === 'upcoming' && (
            <>
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton]}
                onPress={() => navigation.navigate('BirthdayDetail', { birthdayId: birthday.id, initialTab: 'gifts' })}
              >
                <Text style={styles.primaryButtonText}>Plan Gift</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton]}
                onPress={() => navigation.navigate('BirthdayDetail', { birthdayId: birthday.id, initialTab: 'notes' })}
              >
                <Text style={styles.secondaryButtonText}>Add Note</Text>
              </TouchableOpacity>
            </>
          )}
          
          {variant === 'future' && (
            <TouchableOpacity style={[styles.button, styles.secondaryButton, styles.fullWidth]}>
              <Text style={styles.secondaryButtonText}>View Details</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.large,
    marginHorizontal: theme.componentSpacing.card.marginHorizontal,
    marginVertical: theme.componentSpacing.card.marginVertical,
    ...theme.shadows.small,
    borderLeftWidth: 4,
    position: 'relative',
  },
  pressed: {
    ...theme.shadows.medium,
    transform: [{ translateY: -2 }],
  },
  birthdayBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f9ff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#0891b2',
  },
  cakeEmoji: {
    fontSize: 16,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0891b2',
  },
  content: {
    padding: theme.componentSpacing.card.padding,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: theme.typography.fontSize.large,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.neutral.gray900,
    marginBottom: 4,
  },
  meta: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.neutral.gray500,
  },
  messagePreview: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  messageLabel: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.neutral.gray500,
    marginBottom: theme.spacing.sm,
  },
  messageText: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.neutral.gray900,
    lineHeight: theme.typography.fontSize.body * theme.typography.lineHeight.normal,
    marginBottom: theme.spacing.sm,
  },
  editMessage: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.primary.main,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  button: {
    flex: 1,
    paddingVertical: theme.componentSpacing.button.paddingVertical,
    paddingHorizontal: theme.componentSpacing.button.paddingHorizontal,
    borderRadius: theme.borderRadius.medium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.componentSpacing.button.gap,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary.main,
  },
  secondaryButton: {
    backgroundColor: theme.colors.background.tertiary,
  },
  primaryButtonText: {
    color: theme.colors.neutral.white,
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.medium,
  },
  secondaryButtonText: {
    color: theme.colors.neutral.gray700,
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.medium,
  },
  messageIcon: {
    fontSize: 18,
  },
  fullWidth: {
    flex: 1,
  },
});