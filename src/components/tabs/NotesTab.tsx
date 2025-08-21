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
    
    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(() => {
      onSaveNotes();
      showSaveAnimation();
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
    ]).start(() => {
      setShowSaveIndicator(false);
    });
  };
  
  const handleDonePress = () => {
    Keyboard.dismiss();
  };
  
  const firstName = personName.split(' ')[0];
  
  return (
    <View style={styles.container}>
      <View style={styles.notesContainer}>
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
                { top: 8 + (index * 28) }
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
          styles.findGiftsButton,
          { transform: [{ translateY: buttonTranslateY }] }
        ]}
      >
        <TouchableOpacity onPress={onFindGifts} activeOpacity={0.9}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <Text style={styles.giftIcon}>🎁</Text>
            <Text style={styles.buttonText}>Find Gifts Using Notes</Text>
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.privacyNote}>Your notes are private and stored locally</Text>
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
    paddingTop: 8,
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
  findGiftsButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e7',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 6,
  },
  giftIcon: {
    fontSize: 20,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
  },
  privacyNote: {
    textAlign: 'center',
    fontSize: 12,
    color: '#8e8e93',
    marginTop: 8,
  },
});