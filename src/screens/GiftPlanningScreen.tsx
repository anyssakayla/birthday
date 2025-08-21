import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Switch,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { format, subDays } from 'date-fns';

import { theme } from '@/theme';
import { useBirthdayStore } from '@/stores';
import { RootStackParamList } from '@/navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList, 'GiftPlanning'>;
type RoutePropType = RouteProp<RootStackParamList, 'GiftPlanning'>;

interface GiftCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  ideas: string[];
}

const GIFT_CATEGORIES: GiftCategory[] = [
  {
    id: 'experiences',
    name: 'Experiences',
    icon: '🎭',
    color: '#8b5cf6',
    ideas: ['Concert tickets', 'Spa day', 'Cooking class', 'Weekend getaway', 'Wine tasting'],
  },
  {
    id: 'tech',
    name: 'Tech & Gadgets',
    icon: '📱',
    color: '#0ea5e9',
    ideas: ['Smart watch', 'Wireless earbuds', 'Phone accessories', 'Smart home devices', 'Gaming accessories'],
  },
  {
    id: 'books',
    name: 'Books & Media',
    icon: '📚',
    color: '#10b981',
    ideas: ['Bestseller novels', 'Cookbook', 'Art books', 'Subscription services', 'Audiobook membership'],
  },
  {
    id: 'fashion',
    name: 'Fashion',
    icon: '👕',
    color: '#f59e0b',
    ideas: ['Designer accessories', 'Jewelry', 'Watches', 'Clothing items', 'Shoes'],
  },
  {
    id: 'hobbies',
    name: 'Hobbies',
    icon: '🎨',
    color: '#ef4444',
    ideas: ['Art supplies', 'Sports equipment', 'Musical instruments', 'Craft kits', 'Photography gear'],
  },
  {
    id: 'personal',
    name: 'Personal Care',
    icon: '💅',
    color: '#ec4899',
    ideas: ['Skincare sets', 'Perfume/Cologne', 'Grooming kit', 'Wellness products', 'Subscription boxes'],
  },
];

export default function GiftPlanningScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { birthdayId } = route.params;
  
  const { birthdays } = useBirthdayStore();
  const birthday = birthdays.find(b => b.id === birthdayId);
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [budget, setBudget] = useState('');
  const [giftNotes, setGiftNotes] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderDays, setReminderDays] = useState('7');
  
  if (!birthday) {
    navigation.goBack();
    return null;
  }
  
  const birthDate = new Date(birthday.date);
  const reminderDate = subDays(birthDate, parseInt(reminderDays) || 7);
  
  const handleSave = () => {
    // TODO: Save gift planning data
    navigation.goBack();
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
          
          <Text style={styles.headerTitle}>Plan Gift</Text>
          
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Person Info */}
        <View style={styles.personSection}>
          <Text style={styles.personName}>{birthday.name}</Text>
          <Text style={styles.personBirthday}>
            Birthday on {format(birthDate, 'MMMM d')}
          </Text>
        </View>
        
        {/* Budget Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Budget</Text>
          <View style={styles.budgetInput}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.budgetTextInput}
              placeholder="0"
              placeholderTextColor="#94a3b8"
              value={budget}
              onChangeText={setBudget}
              keyboardType="numeric"
              maxLength={6}
            />
          </View>
          <View style={styles.budgetPresets}>
            {['25', '50', '100', '200'].map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.budgetPreset,
                  budget === amount && styles.budgetPresetActive
                ]}
                onPress={() => setBudget(amount)}
              >
                <Text style={[
                  styles.budgetPresetText,
                  budget === amount && styles.budgetPresetTextActive
                ]}>
                  ${amount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Gift Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gift Categories</Text>
          <View style={styles.categoriesGrid}>
            {GIFT_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategory === category.id && styles.categoryCardActive
                ]}
                onPress={() => setSelectedCategory(
                  selectedCategory === category.id ? null : category.id
                )}
              >
                <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                  <Text style={styles.categoryEmoji}>{category.icon}</Text>
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Gift Ideas */}
        {selectedCategory && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gift Ideas</Text>
            <View style={styles.ideasList}>
              {GIFT_CATEGORIES.find(c => c.id === selectedCategory)?.ideas.map((idea, index) => (
                <View key={index} style={styles.ideaItem}>
                  <Ionicons name="gift-outline" size={16} color="#0ea5e9" />
                  <Text style={styles.ideaText}>{idea}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Gift Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gift Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add specific gift ideas, sizes, preferences..."
            placeholderTextColor="#94a3b8"
            multiline
            value={giftNotes}
            onChangeText={setGiftNotes}
            textAlignVertical="top"
          />
        </View>
        
        {/* Reminder Settings */}
        <View style={styles.section}>
          <View style={styles.reminderHeader}>
            <View>
              <Text style={styles.sectionTitle}>Gift Reminder</Text>
              <Text style={styles.reminderSubtext}>
                Get notified to buy the gift
              </Text>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              trackColor={{ false: '#e2e8f0', true: '#0ea5e9' }}
              thumbColor="#ffffff"
            />
          </View>
          
          {reminderEnabled && (
            <View style={styles.reminderSettings}>
              <Text style={styles.reminderLabel}>Remind me</Text>
              <View style={styles.reminderDaysInput}>
                <TextInput
                  style={styles.reminderDaysTextInput}
                  value={reminderDays}
                  onChangeText={setReminderDays}
                  keyboardType="numeric"
                  maxLength={2}
                />
                <Text style={styles.reminderDaysLabel}>days before birthday</Text>
              </View>
              <Text style={styles.reminderDate}>
                Reminder on {format(reminderDate, 'EEEE, MMMM d')}
              </Text>
            </View>
          )}
        </View>
        
        {/* Previous Gifts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Previous Gifts</Text>
          <View style={styles.previousGifts}>
            <Text style={styles.noGiftsText}>No previous gifts recorded</Text>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1d23',
  },
  saveButton: {
    padding: 8,
  },
  saveText: {
    fontSize: 16,
    color: '#0ea5e9',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  personSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  personName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1d23',
    marginBottom: 4,
  },
  personBirthday: {
    fontSize: 16,
    color: '#64748b',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  budgetInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  currencySymbol: {
    fontSize: 24,
    color: '#64748b',
    marginRight: 8,
  },
  budgetTextInput: {
    flex: 1,
    fontSize: 24,
    color: '#1a1d23',
    fontWeight: '600',
  },
  budgetPresets: {
    flexDirection: 'row',
    gap: 8,
  },
  budgetPreset: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  budgetPresetActive: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  budgetPresetText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  budgetPresetTextActive: {
    color: '#ffffff',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    alignItems: 'center',
  },
  categoryCardActive: {
    borderColor: '#0ea5e9',
    borderWidth: 2,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 14,
    color: '#1a1d23',
    fontWeight: '500',
    textAlign: 'center',
  },
  ideasList: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
  },
  ideaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  ideaText: {
    fontSize: 16,
    color: '#1a1d23',
  },
  notesInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    fontSize: 16,
    color: '#1a1d23',
    minHeight: 100,
    lineHeight: 24,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reminderSubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  reminderSettings: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
  },
  reminderLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  reminderDaysInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  reminderDaysTextInput: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#1a1d23',
    fontWeight: '600',
    width: 50,
    textAlign: 'center',
  },
  reminderDaysLabel: {
    fontSize: 16,
    color: '#1a1d23',
  },
  reminderDate: {
    fontSize: 14,
    color: '#0ea5e9',
  },
  previousGifts: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 24,
    alignItems: 'center',
  },
  noGiftsText: {
    fontSize: 14,
    color: '#94a3b8',
  },
});