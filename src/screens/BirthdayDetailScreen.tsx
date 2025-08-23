import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';

import { useBirthdayStore } from '@/stores';
import { RootStackParamList } from '@/navigation/AppNavigator';
import NotesTab from '@components/tabs/NotesTab';
import GiftsTab from '@components/tabs/GiftsTab';
import MessagesTab from '@components/tabs/MessagesTab';
import { getThemeColor } from '@/utils/themeColors';

type NavigationProp = StackNavigationProp<RootStackParamList, 'BirthdayDetail'>;
type RoutePropType = RouteProp<RootStackParamList, 'BirthdayDetail'>;

type TabType = 'notes' | 'gifts' | 'messages';

export default function BirthdayDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { birthdayId, initialTab } = route.params;
  
  const { birthdays, updateBirthday } = useBirthdayStore();
  const [activeTab, setActiveTab] = useState<TabType>(initialTab || 'notes');
  const [isGiftContainerExpanded, setIsGiftContainerExpanded] = useState(true);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  
  // Get birthday directly from store instead of using local state
  const birthday = birthdays.find(b => b.id === birthdayId);
  
  useEffect(() => {
    if (!birthday) {
      navigation.goBack();
    }
  }, [birthday, navigation]);
  
  if (!birthday) {
    return null;
  }
  
  const handleSaveNotes = async () => {
    // Notes are already being updated in handleNotesChange
    console.log('Notes auto-saved');
  };
  
  const handleNotesChange = async (notes: string) => {
    await updateBirthday(birthday.id, { notes });
  };
  
  const handleFindGifts = () => {
    setActiveTab('gifts');
  };
  
  const calculateAge = (birthDate: string) => {
    // Check if year is missing (0000)
    if (birthDate.startsWith('0000')) {
      return null;
    }
    
    const today = new Date();
    const birth = new Date(birthDate);
    const currentYear = today.getFullYear();
    const birthYear = birth.getFullYear();
    
    // Create birthday this year
    const birthdayThisYear = new Date(currentYear, birth.getMonth(), birth.getDate());
    
    // Calculate age they're turning
    let age = currentYear - birthYear;
    
    // If birthday hasn't happened yet this year, they're turning the age
    // If it already happened, they already turned that age
    if (birthdayThisYear > today) {
      return age;
    } else {
      return age + 1; // Next birthday they'll turn this age
    }
  };
  
  const formatBirthdayDate = (dateString: string) => {
    // Handle dates without year
    const dateToFormat = dateString.startsWith('0000') 
      ? dateString.replace('0000', new Date().getFullYear().toString()) 
      : dateString;
    const date = new Date(dateToFormat);
    return format(date, 'MMMM do'); // e.g., "August 17th"
  };
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'notes':
        return (
          <NotesTab
            notes={birthday.notes || ''}
            onNotesChange={handleNotesChange}
            onSaveNotes={handleSaveNotes}
            onFindGifts={handleFindGifts}
            personName={birthday.name}
            isGiftContainerExpanded={isGiftContainerExpanded}
            setIsGiftContainerExpanded={setIsGiftContainerExpanded}
            hasUserInteracted={hasUserInteracted}
            setHasUserInteracted={setHasUserInteracted}
          />
        );
      case 'gifts':
        return (
          <GiftsTab
            notes={birthday.notes || ''}
            personName={birthday.name}
          />
        );
      case 'messages':
        return (
          <MessagesTab
            personName={birthday.name}
          />
        );
    }
  };
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" />
      
      {/* Gradient Header */}
      <LinearGradient
        colors={getThemeColor(birthday.metadata?.themeColorId).gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={28} color="#ffffff" />
            </TouchableOpacity>
            
            <View style={{ flex: 1 }} />
            
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => navigation.navigate('EditContact', { birthdayId: birthday.id })}
            >
              <Ionicons name="pencil" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileSection}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileInitials}>
                {birthday.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{birthday.name}</Text>
              <View style={styles.birthdayInfo}>
                <Text style={styles.profileSubtext}>{formatBirthdayDate(birthday.date)}</Text>
                {calculateAge(birthday.date) !== null && (
                  <Text style={styles.ageText}>• Turning {calculateAge(birthday.date)}</Text>
                )}
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
      
      {/* Tabs Container */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'notes' && styles.tabActive]}
            onPress={() => setActiveTab('notes')}
          >
            <Text style={[styles.tabText, activeTab === 'notes' && styles.tabTextActive]}>
              Notes
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'gifts' && styles.tabActive]}
            onPress={() => {
              setActiveTab('gifts');
              // Auto-collapse gift container when switching away from notes
              if (activeTab === 'notes') {
                setHasUserInteracted(true);
                setIsGiftContainerExpanded(false);
              }
            }}
          >
            <Text style={[styles.tabText, activeTab === 'gifts' && styles.tabTextActive]}>
              Gifts
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'messages' && styles.tabActive]}
            onPress={() => {
              setActiveTab('messages');
              // Auto-collapse gift container when switching away from notes
              if (activeTab === 'notes') {
                setHasUserInteracted(true);
                setIsGiftContainerExpanded(false);
              }
            }}
          >
            <Text style={[styles.tabText, activeTab === 'messages' && styles.tabTextActive]}>
              Messages
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.tabContentContainer}>
          {renderTabContent()}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  header: {
    paddingBottom: 30,
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
    padding: 4,
  },
  editButton: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 20,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
  profileInitials: {
    fontSize: 36,
    fontWeight: '600',
    color: '#ffffff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  profileSubtext: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  birthdayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ageText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  tabsContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  tabs: {
    flexDirection: 'row',
    paddingTop: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e7',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingBottom: 16,
    alignItems: 'center',
    position: 'relative',
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#007aff',
    marginBottom: -1,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8e8e93',
  },
  tabTextActive: {
    color: '#007aff',
  },
  tabContentContainer: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
});