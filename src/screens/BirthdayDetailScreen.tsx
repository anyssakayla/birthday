import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { format, differenceInDays, differenceInYears } from 'date-fns';

import Avatar from '@components/ui/Avatar';
import { theme } from '@/theme';
import { useBirthdayStore } from '@/stores';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { BirthdayWithSync } from '@/types';

type NavigationProp = StackNavigationProp<RootStackParamList, 'BirthdayDetail'>;
type RoutePropType = RouteProp<RootStackParamList, 'BirthdayDetail'>;

export default function BirthdayDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { birthdayId } = route.params;
  
  const { birthdays } = useBirthdayStore();
  const [birthday, setBirthday] = useState<BirthdayWithSync | null>(null);
  
  useEffect(() => {
    const found = birthdays.find(b => b.id === birthdayId);
    if (found) {
      setBirthday(found);
    } else {
      // Navigate back if birthday not found
      navigation.goBack();
    }
  }, [birthdayId, birthdays]);
  
  if (!birthday) {
    return null;
  }
  
  // Calculate birthday details
  const birthDate = new Date(birthday.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  
  // Calculate current age
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  // Calculate next birthday
  const nextBirthday = new Date(birthDate);
  nextBirthday.setFullYear(today.getFullYear());
  
  // If birthday has passed this year, set to next year
  if (nextBirthday < today || 
      (nextBirthday.getMonth() === today.getMonth() && 
       nextBirthday.getDate() === today.getDate())) {
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }
  }
  
  const daysUntilBirthday = differenceInDays(nextBirthday, today);
  const formattedBirthDate = format(birthDate, 'MMMM d, yyyy');
  const formattedNextBirthday = format(nextBirthday, 'EEEE, MMMM d, yyyy');
  
  // Determine if it's today
  const isToday = daysUntilBirthday === 0;
  const isUpcoming = daysUntilBirthday > 0 && daysUntilBirthday <= 7;
  
  const handleCall = () => {
    if (birthday.phone) {
      Linking.openURL(`tel:${birthday.phone}`);
    }
  };
  
  const handleMessage = () => {
    if (birthday.phone) {
      Linking.openURL(`sms:${birthday.phone}`);
    }
  };
  
  const handleEdit = () => {
    navigation.navigate('EditContact', { birthdayId: birthday.id });
  };
  
  const handleDelete = () => {
    Alert.alert(
      'Delete Birthday',
      `Are you sure you want to delete ${birthday.name}'s birthday?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement delete
            navigation.goBack();
          }
        },
      ]
    );
  };
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#1a1d23" />
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={handleEdit}
            >
              <Ionicons name="pencil" size={20} color="#64748b" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Avatar name={birthday.name} size="large" />
          <Text style={styles.name}>{birthday.name}</Text>
          <View style={styles.birthdayInfo}>
            <Text style={styles.cakeEmoji}>🎂</Text>
            <Text style={styles.birthDate}>{formattedBirthDate}</Text>
          </View>
        </View>
        
        {/* Status Card */}
        <View style={[
          styles.statusCard,
          isToday && styles.statusCardToday,
          isUpcoming && styles.statusCardUpcoming,
        ]}>
          {isToday ? (
            <>
              <Text style={[styles.statusTitle, styles.statusTitleToday]}>🎉 It's their birthday today!</Text>
              <Text style={[styles.statusText, styles.statusTextToday]}>Turning {age + 1} years old today!</Text>
            </>
          ) : isUpcoming ? (
            <>
              <Text style={[styles.statusTitle, styles.statusTitleUpcoming]}>Birthday Coming Up!</Text>
              <Text style={[styles.statusText, styles.statusTextUpcoming]}>{formattedNextBirthday}</Text>
              <Text style={[styles.statusSubtext, styles.statusSubtextUpcoming]}>
                {daysUntilBirthday} days away • Turning {age + 1}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.statusTitle}>Next Birthday</Text>
              <Text style={styles.statusText}>{formattedNextBirthday}</Text>
              <Text style={styles.statusSubtext}>
                {daysUntilBirthday} days away • Turning {age + 1}
              </Text>
            </>
          )}
        </View>
        
        {/* Quick Actions */}
        {birthday.phone && (
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.callButton]}
              onPress={handleCall}
            >
              <Ionicons name="call" size={20} color="#ffffff" />
              <Text style={styles.actionButtonText}>Call</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.messageButton]}
              onPress={handleMessage}
            >
              <Ionicons name="chatbubble" size={20} color="#ffffff" />
              <Text style={styles.actionButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Birthday Actions */}
        {isToday && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Birthday Message</Text>
            <View style={styles.messageCard}>
              <Text style={styles.messageText}>
                Happy birthday {birthday.name.split(' ')[0]}! 🎉 Hope you have an amazing day filled with joy and laughter!
              </Text>
              <TouchableOpacity style={styles.editMessageButton}>
                <Text style={styles.editMessageText}>Edit message</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.messageIcon}>💬</Text>
              <Text style={styles.primaryButtonText}>Send Birthday Message</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {isUpcoming && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gift Planning</Text>
            <TouchableOpacity 
              style={styles.giftCard}
              onPress={() => navigation.navigate('GiftPlanning', { birthdayId: birthday.id })}
            >
              <View style={styles.giftCardIcon}>
                <Text style={styles.giftEmoji}>🎁</Text>
              </View>
              <View style={styles.giftCardContent}>
                <Text style={styles.giftCardTitle}>Plan a gift</Text>
                <Text style={styles.giftCardSubtext}>Get gift ideas and set reminders</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        )}
        
        {/* Notes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AddNote', { birthdayId: birthday.id })}>
              <Text style={styles.addNoteButton}>{birthday.notes ? 'Edit' : 'Add note'}</Text>
            </TouchableOpacity>
          </View>
          {birthday.notes ? (
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{birthday.notes}</Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.emptyNotesCard}
              onPress={() => navigation.navigate('AddNote', { birthdayId: birthday.id })}
            >
              <Ionicons name="add-circle-outline" size={24} color="#94a3b8" />
              <Text style={styles.emptyNotesText}>Add a note about {birthday.name.split(' ')[0]}</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Contact Info */}
        {birthday.phone && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <View style={styles.contactCard}>
              <View style={styles.contactRow}>
                <Ionicons name="call-outline" size={20} color="#64748b" />
                <Text style={styles.contactText}>{birthday.phone}</Text>
              </View>
            </View>
          </View>
        )}
        
        {/* Birthday History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Birthday History</Text>
          <View style={styles.historyCard}>
            <Text style={styles.historyText}>
              You've celebrated {Math.floor(Math.random() * 5) + 1} birthdays together
            </Text>
          </View>
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 32,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  name: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1a1d23',
    marginTop: 16,
    marginBottom: 8,
  },
  birthdayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cakeEmoji: {
    fontSize: 20,
  },
  birthDate: {
    fontSize: 16,
    color: '#64748b',
  },
  statusCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  statusCardToday: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  statusCardUpcoming: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1d23',
    marginBottom: 8,
  },
  statusTitleToday: {
    color: '#ffffff',
  },
  statusTitleUpcoming: {
    color: '#ffffff',
  },
  statusText: {
    fontSize: 16,
    color: '#64748b',
  },
  statusTextToday: {
    color: '#ffffff',
  },
  statusTextUpcoming: {
    color: '#ffffff',
  },
  statusSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  statusSubtextUpcoming: {
    color: '#ffffff',
    opacity: 0.9,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  callButton: {
    backgroundColor: '#10b981',
  },
  messageButton: {
    backgroundColor: '#0ea5e9',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addNoteButton: {
    fontSize: 14,
    color: '#0ea5e9',
    fontWeight: '500',
  },
  messageCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  messageText: {
    fontSize: 16,
    color: '#1a1d23',
    lineHeight: 24,
    marginBottom: 12,
  },
  editMessageButton: {
    alignSelf: 'flex-start',
  },
  editMessageText: {
    fontSize: 14,
    color: '#0ea5e9',
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  messageIcon: {
    fontSize: 20,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  giftCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  giftCardIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  giftEmoji: {
    fontSize: 24,
  },
  giftCardContent: {
    flex: 1,
  },
  giftCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1d23',
    marginBottom: 4,
  },
  giftCardSubtext: {
    fontSize: 14,
    color: '#64748b',
  },
  notesCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  notesText: {
    fontSize: 16,
    color: '#1a1d23',
    lineHeight: 24,
  },
  emptyNotesCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    alignItems: 'center',
    gap: 8,
  },
  emptyNotesText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  contactCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactText: {
    fontSize: 16,
    color: '#1a1d23',
  },
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  historyText: {
    fontSize: 16,
    color: '#64748b',
  },
});