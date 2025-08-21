import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '@/theme';
import { useBirthdayStore } from '@/stores';
import { RootStackParamList } from '@/navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList, 'AddNote'>;
type RoutePropType = RouteProp<RootStackParamList, 'AddNote'>;

const NOTE_SUGGESTIONS = [
  "Loves outdoor activities and hiking 🥾",
  "Enjoys reading mystery novels 📚",
  "Coffee enthusiast - prefers dark roast ☕",
  "Allergic to nuts 🥜",
  "Favorite color is blue 💙",
  "Collects vintage vinyl records 🎵",
  "Vegetarian 🥗",
  "Loves traveling to new places ✈️",
  "Plays guitar in their free time 🎸",
  "Has a pet dog named Max 🐕",
];

export default function AddNoteScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { birthdayId } = route.params;
  
  const { birthdays, updateBirthday } = useBirthdayStore();
  const birthday = birthdays.find(b => b.id === birthdayId);
  
  const [note, setNote] = useState(birthday?.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (!birthday) {
      navigation.goBack();
    }
  }, [birthday]);
  
  const handleSave = async () => {
    if (!birthday || isSaving) return;
    
    setIsSaving(true);
    try {
      await updateBirthday(birthdayId, { notes: note.trim() });
      navigation.goBack();
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSuggestionPress = (suggestion: string) => {
    if (note) {
      setNote(note + '\n' + suggestion);
    } else {
      setNote(suggestion);
    }
  };
  
  const characterCount = note.length;
  const maxCharacters = 500;
  
  if (!birthday) return null;
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Add Note</Text>
          
          <TouchableOpacity 
            style={[styles.saveButton, !note.trim() && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!note.trim() || isSaving}
          >
            <Text style={[styles.saveText, !note.trim() && styles.saveTextDisabled]}>
              {isSaving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      
      <ScrollView 
        style={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Person Info */}
        <View style={styles.personInfo}>
          <Text style={styles.personName}>{birthday.name}</Text>
          <Text style={styles.personSubtext}>Add notes to remember important details</Text>
        </View>
        
        {/* Note Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Write your notes here..."
            placeholderTextColor="#94a3b8"
            multiline
            value={note}
            onChangeText={setNote}
            maxLength={maxCharacters}
            textAlignVertical="top"
            autoFocus
          />
          
          {/* Character Counter */}
          <View style={styles.characterCounter}>
            <Text style={[
              styles.characterCountText,
              characterCount > maxCharacters * 0.9 && styles.characterCountWarning
            ]}>
              {characterCount}/{maxCharacters}
            </Text>
          </View>
        </View>
        
        {/* Quick Suggestions */}
        <View style={styles.suggestionsSection}>
          <Text style={styles.suggestionsTitle}>Quick add suggestions</Text>
          <View style={styles.suggestionsList}>
            {NOTE_SUGGESTIONS.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionChip}
                onPress={() => handleSuggestionPress(suggestion)}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Tips */}
        <View style={styles.tipsSection}>
          <View style={styles.tipCard}>
            <Ionicons name="bulb-outline" size={20} color="#f59e0b" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Pro tip</Text>
              <Text style={styles.tipText}>
                Include details like favorite foods, hobbies, gift ideas, or important memories to make birthdays more personal!
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1d23',
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
    color: '#64748b',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveText: {
    fontSize: 16,
    color: '#0ea5e9',
    fontWeight: '600',
  },
  saveTextDisabled: {
    color: '#94a3b8',
  },
  content: {
    flex: 1,
  },
  personInfo: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  personName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1d23',
    marginBottom: 8,
  },
  personSubtext: {
    fontSize: 16,
    color: '#64748b',
  },
  inputContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    fontSize: 16,
    color: '#1a1d23',
    minHeight: 200,
    lineHeight: 24,
  },
  characterCounter: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  characterCountText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  characterCountWarning: {
    color: '#f59e0b',
  },
  suggestionsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  suggestionsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#64748b',
  },
  tipsSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  tipCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
});