import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  StatusBar,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import Avatar from '@components/ui/Avatar';
import { theme } from '@/theme';
import { RootStackParamList } from '@/navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  iconColor?: string;
  action?: () => void;
  hasToggle?: boolean;
  value?: boolean;
  onToggle?: (value: boolean) => void;
  hasChevron?: boolean;
  badge?: string;
}

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  
  // State for toggles
  const [notifications, setNotifications] = useState(true);
  const [birthdayReminders, setBirthdayReminders] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  
  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing coming soon!');
  };
  
  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Export all your birthday data as a CSV file?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => console.log('Exporting data...') },
      ]
    );
  };
  
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => console.log('Deleting account...') },
      ]
    );
  };
  
  const handleRateApp = () => {
    // In a real app, this would open the app store
    Alert.alert('Thank you!', 'We appreciate your feedback!');
  };
  
  const handleSupport = () => {
    Linking.openURL('mailto:support@birthdayapp.com');
  };
  
  const settingSections = [
    {
      title: 'Notifications',
      items: [
        {
          id: 'notifications',
          title: 'Push Notifications',
          subtitle: 'Get notified about upcoming birthdays',
          icon: 'notifications-outline',
          hasToggle: true,
          value: notifications,
          onToggle: setNotifications,
        },
        {
          id: 'reminders',
          title: 'Birthday Reminders',
          subtitle: 'Remind me on the day',
          icon: 'alarm-outline',
          hasToggle: true,
          value: birthdayReminders,
          onToggle: setBirthdayReminders,
        },
        {
          id: 'weekly',
          title: 'Weekly Digest',
          subtitle: 'Summary of upcoming birthdays',
          icon: 'calendar-outline',
          hasToggle: true,
          value: weeklyDigest,
          onToggle: setWeeklyDigest,
        },
      ],
    },
    {
      title: 'Data & Privacy',
      items: [
        {
          id: 'backup',
          title: 'Auto Backup',
          subtitle: 'Backup data to cloud',
          icon: 'cloud-upload-outline',
          hasToggle: true,
          value: autoBackup,
          onToggle: setAutoBackup,
        },
        {
          id: 'export',
          title: 'Export Data',
          subtitle: 'Download your data as CSV',
          icon: 'download-outline',
          hasChevron: true,
          action: handleExportData,
        },
        {
          id: 'privacy',
          title: 'Privacy Policy',
          icon: 'shield-checkmark-outline',
          hasChevron: true,
          action: () => Linking.openURL('https://birthdayapp.com/privacy'),
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          id: 'version',
          title: 'Version',
          subtitle: '1.0.0',
          icon: 'information-circle-outline',
        },
        {
          id: 'rate',
          title: 'Rate Birthday Tracker',
          icon: 'star-outline',
          iconColor: '#f59e0b',
          hasChevron: true,
          action: handleRateApp,
        },
        {
          id: 'support',
          title: 'Support',
          subtitle: 'Get help or report an issue',
          icon: 'help-circle-outline',
          hasChevron: true,
          action: handleSupport,
        },
        {
          id: 'terms',
          title: 'Terms of Service',
          icon: 'document-text-outline',
          hasChevron: true,
          action: () => Linking.openURL('https://birthdayapp.com/terms'),
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          id: 'delete',
          title: 'Delete Account',
          icon: 'trash-outline',
          iconColor: '#ef4444',
          hasChevron: true,
          action: handleDeleteAccount,
        },
      ],
    },
  ];
  
  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={item.action}
      disabled={item.hasToggle}
      activeOpacity={item.hasToggle ? 1 : 0.7}
    >
      <View style={styles.settingItemLeft}>
        <View style={[styles.iconContainer, item.iconColor && { backgroundColor: item.iconColor + '20' }]}>
          <Ionicons 
            name={item.icon as any} 
            size={22} 
            color={item.iconColor || '#64748b'} 
          />
        </View>
        <View style={styles.settingItemText}>
          <Text style={[
            styles.settingItemTitle,
            item.iconColor === '#ef4444' && { color: '#ef4444' }
          ]}>
            {item.title}
          </Text>
          {item.subtitle && (
            <Text style={styles.settingItemSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </View>
      
      {item.hasToggle && (
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          trackColor={{ false: '#e2e8f0', true: '#0ea5e9' }}
          thumbColor="#ffffff"
        />
      )}
      
      {item.hasChevron && (
        <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
      )}
      
      {item.badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
  
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
          
          <Text style={styles.headerTitle}>Profile</Text>
          
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Avatar name="John Doe" size="xlarge" />
          <Text style={styles.profileName}>John Doe</Text>
          <Text style={styles.profileEmail}>john.doe@example.com</Text>
          
          <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        
        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Birthdays</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>2</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
        </View>
        
        {/* Settings Sections */}
        {settingSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map(renderSettingItem)}
            </View>
          </View>
        ))}
        
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1d23',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1d23',
    marginTop: 16,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 20,
  },
  editProfileButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#0ea5e9',
    borderRadius: 20,
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 20,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0ea5e9',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionContent: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingItemText: {
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1d23',
    marginBottom: 2,
  },
  settingItemSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  badge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
});