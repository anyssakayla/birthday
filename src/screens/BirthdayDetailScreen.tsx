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

import { useBirthdayStore } from '@/stores';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { BirthdayWithSync } from '@/types';
import NotesTab from '@components/tabs/NotesTab';
import GiftsTab from '@components/tabs/GiftsTab';
import MessagesTab from '@components/tabs/MessagesTab';

type NavigationProp = StackNavigationProp<RootStackParamList, 'BirthdayDetail'>;
type RoutePropType = RouteProp<RootStackParamList, 'BirthdayDetail'>;

type TabType = 'notes' | 'gifts' | 'messages';

export default function BirthdayDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { birthdayId } = route.params;
  
  const { birthdays, updateBirthday } = useBirthdayStore();
  const [birthday, setBirthday] = useState<BirthdayWithSync | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('notes');
  
  useEffect(() => {
    const found = birthdays.find(b => b.id === birthdayId);
    if (found) {
      setBirthday(found);
    } else {
      navigation.goBack();
    }
  }, [birthdayId, birthdays]);
  
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
        colors={['#667eea', '#764ba2']}
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
            
            <Text style={styles.headerTitle}>{birthday.name}</Text>
            
            <View style={{ width: 28 }} />
          </View>
          
          <View style={styles.profileSection}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileInitials}>
                {birthday.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{birthday.name}</Text>
              <Text style={styles.profileSubtext}>Personalized Suggestions</Text>
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
            onPress={() => setActiveTab('gifts')}
          >
            <Text style={[styles.tabText, activeTab === 'gifts' && styles.tabTextActive]}>
              Gifts
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'messages' && styles.tabActive]}
            onPress={() => setActiveTab('messages')}
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