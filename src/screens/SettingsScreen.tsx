import React, { useState, useRef, useEffect } from 'react';
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
  Animated,
  Dimensions,
  Modal,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { theme } from '@/theme';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { useBirthdayStore } from '@/stores/birthdayStore';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

const { width: screenWidth } = Dimensions.get('window');

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  iconBackgroundColor?: string;
  iconColor?: string;
  action?: () => void;
  hasToggle?: boolean;
  value?: boolean;
  onToggle?: (value: boolean) => void;
  hasChevron?: boolean;
  badge?: string;
  expandable?: boolean;
  expandableContent?: ExpandableItem[];
}

interface ExpandableItem {
  id: string;
  label: string;
  value: string;
  action?: () => void;
}

// Simple Time Picker Component with Infinite Scroll
const CustomTimePicker = ({ time, onTimeChange }: { time: Date; onTimeChange: (date: Date) => void }) => {
  const baseHours = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
  const baseMinutes = ['00', '15', '30', '45'];
  
  // Create arrays with multiple copies for infinite scroll effect
  const hours = [...baseHours, ...baseHours, ...baseHours, ...baseHours, ...baseHours];
  const minutes = [...baseMinutes, ...baseMinutes, ...baseMinutes, ...baseMinutes, ...baseMinutes];
  
  const currentHour = time.getHours();
  const currentMinute = time.getMinutes();
  const [selectedHour, setSelectedHour] = useState(String(currentHour % 12 || 12));
  const [selectedMinute, setSelectedMinute] = useState(
    baseMinutes.reduce((prev, curr) => 
      Math.abs(parseInt(curr) - currentMinute) < Math.abs(parseInt(prev) - currentMinute) ? curr : prev
    )
  );
  const [selectedPeriod, setSelectedPeriod] = useState(currentHour >= 12 ? 'PM' : 'AM');
  
  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);
  const itemHeight = 44; // Height of each item

  // Initialize scroll positions to middle of the list
  useEffect(() => {
    const hourIndex = baseHours.findIndex(h => h === selectedHour);
    const minuteIndex = baseMinutes.findIndex(m => m === selectedMinute);
    
    setTimeout(() => {
      hourScrollRef.current?.scrollTo({ 
        y: (hourIndex + baseHours.length * 2) * itemHeight - itemHeight * 2, 
        animated: false 
      });
      minuteScrollRef.current?.scrollTo({ 
        y: (minuteIndex + baseMinutes.length * 2) * itemHeight - itemHeight * 2, 
        animated: false 
      });
    }, 100);
  }, []);

  const updateTime = (hour: string, minute: string, period: string) => {
    const newDate = new Date(time);
    let adjustedHour = parseInt(hour);
    if (period === 'PM' && adjustedHour !== 12) {
      adjustedHour = adjustedHour + 12;
    } else if (period === 'AM' && adjustedHour === 12) {
      adjustedHour = 0;
    }
    newDate.setHours(adjustedHour);
    newDate.setMinutes(parseInt(minute));
    onTimeChange(newDate);
  };

  const handleScroll = (event: any, scrollRef: React.RefObject<ScrollView>, baseArray: string[]) => {
    const y = event.nativeEvent.contentOffset.y;
    const baseHeight = baseArray.length * itemHeight;
    
    // If scrolled too far up or down, reset to middle
    if (y < baseHeight || y > baseHeight * 3) {
      scrollRef.current?.scrollTo({ 
        y: y % baseHeight + baseHeight * 2, 
        animated: false 
      });
    }
  };

  return (
    <View style={timePickerStyles.container}>
      <View style={timePickerStyles.row}>
        {/* Hours */}
        <View style={timePickerStyles.column}>
          <Text style={timePickerStyles.label}>Hour</Text>
          <View style={timePickerStyles.pickerContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0)']}
              style={timePickerStyles.gradientTop}
              pointerEvents="none"
            />
            <ScrollView 
              ref={hourScrollRef}
              style={timePickerStyles.scrollView} 
              showsVerticalScrollIndicator={false}
              onScroll={(e) => handleScroll(e, hourScrollRef, baseHours)}
              scrollEventThrottle={16}
            >
              {hours.map((hour, index) => (
                <TouchableOpacity
                  key={`${hour}-${index}`}
                  onPress={() => {
                    setSelectedHour(hour);
                    updateTime(hour, selectedMinute, selectedPeriod);
                    // Center the selected item
                    const scrollPosition = index * itemHeight - (150 / 2) + (itemHeight / 2);
                    hourScrollRef.current?.scrollTo({ y: scrollPosition, animated: true });
                  }}
                  style={[
                    timePickerStyles.item,
                    selectedHour === hour && timePickerStyles.selectedItem,
                  ]}
                >
                  <Text style={[
                    timePickerStyles.itemText,
                    selectedHour === hour && timePickerStyles.selectedText,
                  ]}>
                    {hour}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <LinearGradient
              colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
              style={timePickerStyles.gradientBottom}
              pointerEvents="none"
            />
          </View>
        </View>

        {/* Minutes */}
        <View style={timePickerStyles.column}>
          <Text style={timePickerStyles.label}>Minute</Text>
          <View style={timePickerStyles.pickerContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0)']}
              style={timePickerStyles.gradientTop}
              pointerEvents="none"
            />
            <ScrollView 
              ref={minuteScrollRef}
              style={timePickerStyles.scrollView} 
              showsVerticalScrollIndicator={false}
              onScroll={(e) => handleScroll(e, minuteScrollRef, baseMinutes)}
              scrollEventThrottle={16}
            >
              {minutes.map((minute, index) => (
                <TouchableOpacity
                  key={`${minute}-${index}`}
                  onPress={() => {
                    setSelectedMinute(minute);
                    updateTime(selectedHour, minute, selectedPeriod);
                    // Center the selected item
                    const scrollPosition = index * itemHeight - (150 / 2) + (itemHeight / 2);
                    minuteScrollRef.current?.scrollTo({ y: scrollPosition, animated: true });
                  }}
                  style={[
                    timePickerStyles.item,
                    selectedMinute === minute && timePickerStyles.selectedItem,
                  ]}
                >
                  <Text style={[
                    timePickerStyles.itemText,
                    selectedMinute === minute && timePickerStyles.selectedText,
                  ]}>
                    {minute}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <LinearGradient
              colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
              style={timePickerStyles.gradientBottom}
              pointerEvents="none"
            />
          </View>
        </View>

        {/* AM/PM */}
        <View style={timePickerStyles.column}>
          <Text style={timePickerStyles.label}>Period</Text>
          <View style={timePickerStyles.periodContainer}>
            <TouchableOpacity
              onPress={() => {
                setSelectedPeriod('AM');
                updateTime(selectedHour, selectedMinute, 'AM');
              }}
              style={[
                timePickerStyles.periodItem,
                selectedPeriod === 'AM' && timePickerStyles.selectedPeriodItem,
              ]}
            >
              <Text style={[
                timePickerStyles.periodText,
                selectedPeriod === 'AM' && timePickerStyles.selectedPeriodText,
              ]}>
                AM
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSelectedPeriod('PM');
                updateTime(selectedHour, selectedMinute, 'PM');
              }}
              style={[
                timePickerStyles.periodItem,
                selectedPeriod === 'PM' && timePickerStyles.selectedPeriodItem,
              ]}
            >
              <Text style={[
                timePickerStyles.periodText,
                selectedPeriod === 'PM' && timePickerStyles.selectedPeriodText,
              ]}>
                PM
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

// Time Picker Styles
const timePickerStyles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8e8e93',
    marginBottom: 10,
  },
  scrollView: {
    height: 150,
  },
  pickerContainer: {
    position: 'relative',
    height: 150,
  },
  item: {
    height: 44,
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderRadius: 8,
  },
  selectedItem: {
    backgroundColor: '#007aff',
  },
  itemText: {
    fontSize: 18,
    color: '#1c1c1e',
    textAlign: 'center',
  },
  selectedText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    zIndex: 1,
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    zIndex: 1,
  },
  periodContainer: {
    paddingTop: 10,
  },
  periodItem: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: '#f0f0f2',
  },
  selectedPeriodItem: {
    backgroundColor: '#007aff',
  },
  periodText: {
    fontSize: 16,
    color: '#1c1c1e',
    fontWeight: '500',
  },
  selectedPeriodText: {
    color: '#ffffff',
  },
});

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const birthdays = useBirthdayStore((state) => state.birthdays);
  
  // State for toggles
  const [birthdayReminders, setBirthdayReminders] = useState(true);
  const [dealsAndSales, setDealsAndSales] = useState(false);
  const [autoSendMessages, setAutoSendMessages] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  
  // Time picker state
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [notificationTime, setNotificationTime] = useState(new Date());
  
  // Set default time to 9:00 AM
  useState(() => {
    const defaultTime = new Date();
    defaultTime.setHours(9);
    defaultTime.setMinutes(0);
    setNotificationTime(defaultTime);
  });
  
  // Animation refs for expandable content
  const animationRefs = useRef<{ [key: string]: Animated.Value }>({});
  
  // Calculate stats
  const currentMonth = new Date().getMonth();
  const thisMonthCount = birthdays.filter(b => new Date(b.date).getMonth() === currentMonth).length;
  const upcomingCount = birthdays.filter(b => {
    const today = new Date();
    const birthdayDate = new Date(b.date);
    birthdayDate.setFullYear(today.getFullYear());
    const daysDiff = Math.ceil((birthdayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff > 0 && daysDiff <= 7;
  }).length;
  
  const toggleExpanded = (itemId: string) => {
    const isExpanded = expandedItems.includes(itemId);
    
    if (!animationRefs.current[itemId]) {
      animationRefs.current[itemId] = new Animated.Value(0);
    }
    
    if (isExpanded) {
      // Collapse
      Animated.timing(animationRefs.current[itemId], {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
      setExpandedItems(expandedItems.filter(id => id !== itemId));
    } else {
      // Expand
      setExpandedItems([...expandedItems, itemId]);
      Animated.timing(animationRefs.current[itemId], {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };
  
  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing coming soon!');
  };
  
  const handleImportBirthdays = () => {
    Alert.alert(
      'Import Birthdays',
      'Choose a source to import from',
      [
        { text: 'Contacts', onPress: () => console.log('Import from contacts') },
        { text: 'Calendar', onPress: () => console.log('Import from calendar') },
        { text: 'Facebook', onPress: () => console.log('Import from Facebook') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };
  
  const handleManageExisting = () => {
    navigation.navigate('Home');
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
    Alert.alert('Thank you!', 'We appreciate your feedback!');
  };
  
  const handleHelpCenter = () => {
    Linking.openURL('https://birthdayapp.com/help');
  };
  
  const handleShareApp = () => {
    Alert.alert('Share Birthday Tracker', 'Sharing functionality coming soon!');
  };
  
  const handleDefaultTemplates = () => {
    navigation.navigate('Templates');
  };
  
  const handleNotificationSettings = (settingId: string) => {
    if (settingId === 'days') {
      Alert.alert('Days Before Reminder', 'Choose when to be reminded: 1, 3, or 7 days before');
    } else if (settingId === 'time') {
      setShowTimePicker(true);
    }
  };
  
  
  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };
  
  const settingSections = [
    {
      title: 'Notifications',
      items: [
        {
          id: 'reminders',
          title: 'Birthday Reminders',
          icon: '🔔',
          iconBackgroundColor: '#f0f9ff',
          iconColor: '#007aff',
          hasToggle: true,
          value: birthdayReminders,
          onToggle: setBirthdayReminders,
          expandable: true,
          expandableContent: [
            {
              id: 'days',
              label: 'Days before reminder',
              value: '1, 3, 7 days',
              action: () => handleNotificationSettings('days'),
            },
            {
              id: 'time',
              label: 'Notification time',
              value: formatTime(notificationTime),
              action: () => handleNotificationSettings('time'),
            },
          ],
        },
        {
          id: 'deals',
          title: 'Deals & Sales',
          subtitle: 'Get notified when gifts for your friends go on sale',
          icon: '💸',
          iconBackgroundColor: '#f0f9ff',
          iconColor: '#007aff',
          hasToggle: true,
          value: dealsAndSales,
          onToggle: setDealsAndSales,
        },
      ],
    },
    {
      title: 'Messages',
      items: [
        {
          id: 'templates',
          title: 'Default Templates',
          subtitle: 'Friend, Family, Colleague templates',
          icon: '📝',
          iconBackgroundColor: '#f0f4ff',
          iconColor: '#667eea',
          hasChevron: true,
          action: handleDefaultTemplates,
        },
        {
          id: 'autosend',
          title: 'Auto-send Messages',
          icon: '🚀',
          iconBackgroundColor: '#f0f4ff',
          iconColor: '#667eea',
          badge: 'PRO',
          hasToggle: true,
          value: autoSendMessages,
          onToggle: setAutoSendMessages,
        },
      ],
    },
    {
      title: 'Manage Birthdays',
      items: [
        {
          id: 'import',
          title: 'Import New Birthdays',
          subtitle: 'Sync from Contacts, Calendar, Facebook',
          icon: '📥',
          iconBackgroundColor: '#fff0f6',
          iconColor: '#ec4899',
          hasChevron: true,
          action: handleImportBirthdays,
        },
        {
          id: 'manage',
          title: 'Manage Existing',
          subtitle: 'Edit or remove birthdays',
          icon: '✏️',
          iconBackgroundColor: '#fff0f6',
          iconColor: '#ec4899',
          hasChevron: true,
          action: handleManageExisting,
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          id: 'darkmode',
          title: 'Dark Mode',
          icon: '🌙',
          iconBackgroundColor: '#fff0f6',
          iconColor: '#ec4899',
          hasToggle: true,
          value: darkMode,
          onToggle: setDarkMode,
        },
      ],
    },
    {
      title: 'Data & Privacy',
      items: [
        {
          id: 'export',
          title: 'Export Data',
          subtitle: 'Download your data as CSV',
          icon: '📤',
          iconBackgroundColor: '#f0fdf4',
          iconColor: '#10b981',
          hasChevron: true,
          action: handleExportData,
        },
        {
          id: 'privacy',
          title: 'Privacy Policy',
          icon: '🔒',
          iconBackgroundColor: '#f0fdf4',
          iconColor: '#10b981',
          hasChevron: true,
          action: () => Linking.openURL('https://birthdayapp.com/privacy'),
        },
        {
          id: 'terms',
          title: 'Terms of Service',
          icon: '📄',
          iconBackgroundColor: '#f0fdf4',
          iconColor: '#10b981',
          hasChevron: true,
          action: () => Linking.openURL('https://birthdayapp.com/terms'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          title: 'Help Center',
          icon: '❓',
          iconBackgroundColor: '#fef3c7',
          iconColor: '#f59e0b',
          hasChevron: true,
          action: handleHelpCenter,
        },
        {
          id: 'rate',
          title: 'Rate Birthday Tracker',
          subtitle: 'Love the app? Let us know!',
          icon: '⭐',
          iconBackgroundColor: '#fef3c7',
          iconColor: '#f59e0b',
          hasChevron: true,
          action: handleRateApp,
        },
        {
          id: 'share',
          title: 'Share with Friends',
          subtitle: 'Spread the birthday love',
          icon: '💌',
          iconBackgroundColor: '#fef3c7',
          iconColor: '#f59e0b',
          hasChevron: true,
          action: handleShareApp,
        },
      ],
    },
  ];
  
  const renderSettingItem = (item: SettingItem) => {
    const isExpanded = expandedItems.includes(item.id);
    const animation = animationRefs.current[item.id] || new Animated.Value(0);
    
    const handlePress = () => {
      if (item.expandable && !item.hasToggle) {
        toggleExpanded(item.id);
      } else if (item.action) {
        item.action();
      }
    };
    
    return (
      <View key={item.id}>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={handlePress}
          disabled={item.hasToggle && !item.expandable}
          activeOpacity={0.7}
        >
          <View style={styles.settingItemLeft}>
            <View style={[styles.iconContainer, { backgroundColor: item.iconBackgroundColor || '#f1f5f9' }]}>
              <Text style={styles.iconEmoji}>{item.icon}</Text>
            </View>
            <View style={styles.settingItemText}>
              <View style={styles.titleRow}>
                <Text style={styles.settingItemTitle}>{item.title}</Text>
                {item.badge && (
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.proBadge}
                  >
                    <Text style={styles.proBadgeText}>{item.badge}</Text>
                  </LinearGradient>
                )}
              </View>
              {item.subtitle && (
                <Text style={styles.settingItemSubtitle}>{item.subtitle}</Text>
              )}
            </View>
          </View>
          
          {item.hasToggle && (
            <TouchableOpacity
              onPress={() => {
                item.onToggle?.(!item.value);
                if (item.expandable) {
                  // If turning on and expandable, auto-expand
                  if (!item.value && !isExpanded) {
                    toggleExpanded(item.id);
                  }
                }
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.toggleSwitch, item.value && styles.toggleSwitchActive]}>
                <Animated.View
                  style={[
                    styles.toggleKnob,
                    {
                      transform: [
                        {
                          translateX: item.value ? 20 : 2,
                        },
                      ],
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>
          )}
          
          {item.hasChevron && (
            <Text style={styles.chevron}>›</Text>
          )}
        </TouchableOpacity>
        
        {item.expandable && item.expandableContent && (
          <Animated.View
            style={[
              styles.expandableContent,
              {
                maxHeight: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 200],
                }),
                opacity: animation,
              },
            ]}
          >
            {item.expandableContent.map((subItem) => (
              <TouchableOpacity
                key={subItem.id}
                style={styles.subSetting}
                onPress={subItem.action}
                activeOpacity={0.7}
              >
                <Text style={styles.subSettingLabel}>{subItem.label}</Text>
                <View style={styles.subSettingRight}>
                  <Text style={styles.subSettingValue}>{subItem.value}</Text>
                  <Text style={styles.subChevron}>›</Text>
                </View>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <SafeAreaView style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Profile</Text>
            
            <View style={{ width: 40 }} />
          </View>
          
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <LinearGradient
              colors={['#ff9500', '#ff7a00']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.profileAvatar}
            >
              <Text style={styles.profileAvatarText}>JD</Text>
            </LinearGradient>
            <Text style={styles.profileName}>John Doe</Text>
            <Text style={styles.profilePhone}>+1 (555) 123-4567</Text>
            
            <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
          
          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{birthdays.length}</Text>
              <Text style={styles.statLabel}>Birthdays</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{thisMonthCount}</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{upcomingCount}</Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </View>
          </View>
        </SafeAreaView>
        
        <View style={styles.settingsContainer}>
          {/* Settings Sections */}
          {settingSections.map((section) => (
            <View key={section.title} style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.settingsCard}>
                {section.items.map(renderSettingItem)}
              </View>
            </View>
          ))}
          
          {/* Footer */}
          <View style={styles.footerSection}>
            <Text style={styles.version}>Version 1.0.0</Text>
            <TouchableOpacity onPress={handleDeleteAccount}>
              <Text style={styles.deleteAccount}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      {/* Custom Time Picker Modal */}
      {showTimePicker && (
        <Modal
          transparent
          visible={showTimePicker}
          animationType="slide"
          onRequestClose={() => setShowTimePicker(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowTimePicker(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Text style={styles.modalCancel}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Notification Time</Text>
                <TouchableOpacity onPress={() => {
                  setShowTimePicker(false);
                  // Time is already updated via the ScrollView selections
                }}>
                  <Text style={styles.modalDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <CustomTimePicker
                time={notificationTime}
                onTimeChange={setNotificationTime}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#007aff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1c1c1e',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  profileSection: {
    alignItems: 'center',
    paddingBottom: 20,
    gap: 12,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileAvatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#ffffff',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1c1c1e',
  },
  profilePhone: {
    fontSize: 16,
    color: '#8e8e93',
  },
  editProfileButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#007aff',
    borderRadius: 20,
  },
  editProfileText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.04)',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007aff',
  },
  statLabel: {
    fontSize: 13,
    color: '#8e8e93',
    marginTop: 4,
  },
  settingsContainer: {
    padding: 16,
  },
  settingsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8e8e93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingLeft: 16,
  },
  settingsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 18,
  },
  settingItemText: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1c1c1e',
  },
  settingItemSubtitle: {
    fontSize: 13,
    color: '#8e8e93',
    marginTop: 2,
  },
  proBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  proBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  toggleSwitch: {
    width: 51,
    height: 31,
    backgroundColor: '#e5e5e7',
    borderRadius: 31,
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: '#34c759',
  },
  toggleKnob: {
    width: 27,
    height: 27,
    backgroundColor: '#ffffff',
    borderRadius: 27/2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  chevron: {
    fontSize: 16,
    color: '#c7c7cc',
  },
  expandableContent: {
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingLeft: 60,
  },
  subSetting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  subSettingLabel: {
    fontSize: 15,
    color: '#1c1c1e',
  },
  subSettingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subSettingValue: {
    fontSize: 15,
    color: '#007aff',
  },
  subChevron: {
    fontSize: 16,
    color: '#c7c7cc',
  },
  footerSection: {
    paddingVertical: 32,
    paddingBottom: 40,
    alignItems: 'center',
  },
  version: {
    fontSize: 13,
    color: '#8e8e93',
    marginBottom: 16,
  },
  deleteAccount: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ff3b30',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalCancel: {
    fontSize: 17,
    color: '#007aff',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  modalDone: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007aff',
  },
});