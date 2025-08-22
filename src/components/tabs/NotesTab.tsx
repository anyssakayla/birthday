import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Keyboard,
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface NotesTabProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  onSaveNotes: () => void;
  onFindGifts: () => void;
  personName: string;
}

const { height: screenHeight } = Dimensions.get('window');

export default function NotesTab({ 
  notes, 
  onNotesChange, 
  onSaveNotes, 
  onFindGifts,
  personName 
}: NotesTabProps) {
  const [localNotes, setLocalNotes] = useState(notes);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [keyboardShown, setKeyboardShown] = useState(false);
  const saveIndicatorOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(0)).current;
  const doneButtonOpacity = useRef(new Animated.Value(0)).current;
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardShown(true);
        Animated.parallel([
          Animated.timing(buttonTranslateY, {
            toValue: 200,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(doneButtonOpacity, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      }
    );
    
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardShown(false);
        Animated.parallel([
          Animated.timing(buttonTranslateY, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(doneButtonOpacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      }
    );
    
    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);
  
  const handleNotesChange = (text: string) => {
    setLocalNotes(text);
    onNotesChange(text);
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set new timeout for auto-save (without visual indicator)
    saveTimeoutRef.current = setTimeout(() => {
      onSaveNotes();
    }, 1000);
  };
  
  const showSaveAnimation = () => {
    setShowSaveIndicator(true);
    Animated.sequence([
      Animated.timing(saveIndicatorOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(saveIndicatorOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Use setTimeout instead of animation callback to avoid React warning
    setTimeout(() => {
      setShowSaveIndicator(false);
    }, 2600);
  };
  
  const handleDonePress = () => {
    Keyboard.dismiss();
    showSaveAnimation();
  };
  
  const firstName = personName.split(' ')[0];
  
  return (
    <View style={styles.container}>
      <View style={styles.notesContainer}>
        {!localNotes.trim() && (
          <View style={styles.headerSection}>
            <Text style={styles.headerTitle}>Remember</Text>
            <Text style={styles.headerSubtext}>
              Add notes to remember things about {firstName} to help you find thoughtful gifts
            </Text>
          </View>
        )}
        
        {showSaveIndicator && (
          <Animated.View 
            style={[
              styles.saveIndicator,
              { opacity: saveIndicatorOpacity }
            ]}
          >
            <View style={styles.checkmark}>
              <Ionicons name="checkmark" size={14} color="#ffffff" />
            </View>
          </Animated.View>
        )}
        
        {keyboardShown && (
          <Animated.View 
            style={[
              styles.doneButton,
              { opacity: doneButtonOpacity }
            ]}
          >
            <TouchableOpacity onPress={handleDonePress} activeOpacity={0.9}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.doneButtonGradient}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}
        
        <ScrollView 
          style={styles.notesPaper}
          contentContainerStyle={styles.notesScrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
        >
          {/* Create lined paper effect */}
          {Array.from({ length: 30 }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.paperLine,
                { top: 22 + (index * 28) }
              ]}
            />
          ))}
          <TextInput
            style={styles.notesTextarea}
            placeholder={`Example: Loves painting and video games. Favorite coffee: Oat milk latte. Been wanting new running shoes.`}
            placeholderTextColor="#c7c7cc"
            multiline
            value={localNotes}
            onChangeText={handleNotesChange}
            textAlignVertical="top"
            scrollEnabled={false}
          />
        </ScrollView>
      </View>
      
      <Animated.View 
        style={[
          styles.giftSection,
          { transform: [{ translateY: buttonTranslateY }] }
        ]}
      >
        <View style={styles.giftContainer}>
          <Text style={styles.giftUrgencyHeader}>
            Need help finding {firstName} a gift?
          </Text>
          <Text style={styles.giftDescription}>
            We've got you covered. Get personalized suggestions based on your notes.
          </Text>
          
          <TouchableOpacity onPress={onFindGifts} activeOpacity={0.9}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Generate Gift Ideas</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <View style={styles.orDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.dividerLine} />
          </View>
          
          <TouchableOpacity 
            onPress={() => console.log('Gift card option')} 
            activeOpacity={0.8}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Quick Option: Send a Gift Card</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  notesContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  headerSection: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 6,
  },
  headerSubtext: {
    fontSize: 14,
    color: '#8e8e93',
    lineHeight: 20,
  },
  saveIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  checkmark: {
    width: 24,
    height: 24,
    backgroundColor: '#34c759',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesPaper: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    position: 'relative',
  },
  notesScrollContent: {
    paddingTop: 18,
    minHeight: '100%',
  },
  paperLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#e5e5e7',
  },
  notesTextarea: {
    fontSize: 16,
    lineHeight: 28,
    color: '#1c1c1e',
    padding: 0,
    paddingHorizontal: 4,
    paddingTop: Platform.OS === 'ios' ? 2 : 0,
    textAlignVertical: 'top',
    minHeight: 500,
  },
  doneButton: {
    position: 'absolute',
    top: -5,
    right: 20,
    zIndex: 20,
  },
  doneButtonGradient: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 18,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  doneButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  giftSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e7',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  giftContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e5e5e7',
  },
  giftUrgencyHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 8,
    textAlign: 'center',
  },
  giftDescription: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 16,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e5e7',
  },
  orText: {
    fontSize: 14,
    color: '#8e8e93',
    marginHorizontal: 16,
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e7',
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#667eea',
    textAlign: 'center',
  },
});