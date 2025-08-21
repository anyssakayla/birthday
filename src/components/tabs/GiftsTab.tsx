import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GiftsTabProps {
  notes: string;
  personName: string;
}

const { width: screenWidth } = Dimensions.get('window');
const GIFT_CARDS = ['Amazon', 'Target', 'Visa', 'Starbucks', 'Spa', 'iTunes'];

export default function GiftsTab({ notes, personName }: GiftsTabProps) {
  const [giftIdeas, setGiftIdeas] = useState('');
  const [useNotes, setUseNotes] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  useEffect(() => {
    if (useNotes && notes) {
      setGiftIdeas(notes);
    } else if (!useNotes) {
      setGiftIdeas('');
    }
  }, [useNotes, notes]);
  
  const handleGenerateGifts = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      Alert.alert(
        'Gift Ideas Generated!',
        'Personalized gift suggestions based on notes and preferences.',
        [{ text: 'OK' }]
      );
    }, 1500);
  };
  
  const handleGiftCardPress = (cardName: string) => {
    Alert.alert(
      `${cardName} Gift Card`,
      `Purchase a ${cardName} gift card for ${personName.split(' ')[0]}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Buy Now', onPress: () => console.log(`Buying ${cardName} gift card`) },
      ]
    );
  };
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.giftGenerator}>
        <Text style={styles.generatorTitle}>Generate Personalized Gifts</Text>
        
        <TextInput
          style={[
            styles.giftInput,
            useNotes && styles.giftInputItalic
          ]}
          placeholder="Any specific ideas? (optional)"
          placeholderTextColor="#8e8e93"
          multiline
          value={giftIdeas}
          onChangeText={(text) => {
            setGiftIdeas(text);
            if (text !== notes) {
              setUseNotes(false);
            }
          }}
          textAlignVertical="top"
        />
        
        <TouchableOpacity 
          style={[styles.checkboxContainer, useNotes && styles.checkboxContainerChecked]}
          onPress={() => setUseNotes(!useNotes)}
        >
          <View style={[styles.checkbox, useNotes && styles.checkboxChecked]}>
            {useNotes && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <View style={styles.checkboxLabel}>
            <Text style={styles.checkboxTitle}>Use {personName.split(' ')[0]}'s notes</Text>
            <Text style={styles.checkboxDescription}>
              Include saved details for more personalized suggestions
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.generateButton, isGenerating && styles.generateButtonLoading]}
          onPress={handleGenerateGifts}
          disabled={isGenerating}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.generateButtonGradient}
          >
            <Text style={styles.generateButtonText}>
              {isGenerating ? 'Generating...' : `Generate Gift Ideas for ${personName.split(' ')[0]}`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      
      <View style={styles.giftCardsSection}>
        <Text style={styles.sectionTitle}>Quick Gift Cards</Text>
        <View style={styles.giftCardsGrid}>
          {GIFT_CARDS.map((card) => (
            <TouchableOpacity
              key={card}
              style={styles.giftCardItem}
              onPress={() => handleGiftCardPress(card)}
            >
              <Text style={styles.giftCardText}>{card}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f2f2f7',
  },
  giftGenerator: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  generatorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 16,
  },
  giftInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 2,
    borderColor: '#e5e5e7',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1c1c1e',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
    lineHeight: 22,
  },
  giftInputItalic: {
    fontStyle: 'italic',
    color: '#3a3a3c',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 20,
  },
  checkboxContainerChecked: {
    backgroundColor: '#e7f0ff',
    borderColor: '#007aff',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#c7c7cc',
    borderRadius: 6,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#007aff',
    borderColor: '#007aff',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  checkboxLabel: {
    flex: 1,
  },
  checkboxTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 4,
  },
  checkboxDescription: {
    fontSize: 14,
    color: '#8e8e93',
    lineHeight: 20,
  },
  generateButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 6,
  },
  generateButtonLoading: {
    opacity: 0.7,
  },
  generateButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
  },
  giftCardsSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8e8e93',
    textAlign: 'center',
    marginBottom: 16,
  },
  giftCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  giftCardItem: {
    width: (screenWidth - 64) / 3,
    backgroundColor: '#f9f9f9',
    borderWidth: 2,
    borderColor: '#e5e5e7',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
  },
  giftCardText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1c1c1e',
  },
});