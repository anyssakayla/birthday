import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useBirthdayStore } from '@/stores';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { themeColors } from '@/utils/themeColors';
import SegmentedDatePicker from '@/components/ui/SegmentedDatePicker';

type NavigationProp = StackNavigationProp<RootStackParamList, 'EditContact'>;
type RoutePropType = RouteProp<RootStackParamList, 'EditContact'>;

export default function EditContactScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { birthdayId } = route.params;
  
  const { birthdays, updateBirthday } = useBirthdayStore();
  const birthday = birthdays.find(b => b.id === birthdayId);
  const [selectedColorId, setSelectedColorId] = useState(
    birthday?.metadata?.themeColorId || '1'
  );
  
  if (!birthday) {
    return null;
  }
  
  const handleColorSelect = async (colorId: string) => {
    setSelectedColorId(colorId);
    
    // Save the color selection to birthday metadata
    await updateBirthday(birthday.id, {
      metadata: {
        ...birthday.metadata,
        themeColorId: colorId,
      }
    });
  };
  
  const handleDateChange = async (newDate: string) => {
    await updateBirthday(birthday.id, {
      date: newDate,
    });
  };
  
  const calculateAge = (birthDate: string) => {
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
  
  const selectedColor = themeColors.find(c => c.id === selectedColorId) || themeColors[0];
  const turningAge = calculateAge(birthday.date);
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={selectedColor.gradient}
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
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Edit Contact</Text>
            
            <View style={{ width: 24 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>
      
      <ScrollView style={styles.content}>
        {/* Theme Color Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Theme Color</Text>
          <View style={styles.colorPicker}>
            {themeColors.map((color) => (
              <TouchableOpacity
                key={color.id}
                style={styles.colorOptionWrapper}
                onPress={() => handleColorSelect(color.id)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={color.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.colorOption,
                    selectedColorId === color.id && styles.colorOptionSelected
                  ]}
                >
                  {selectedColorId === color.id && (
                    <Ionicons name="checkmark" size={24} color="#ffffff" />
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity style={styles.uploadButton}>
            <Ionicons name="camera-outline" size={20} color="#64748b" />
            <Text style={styles.uploadButtonText}>Upload Custom Photo</Text>
          </TouchableOpacity>
        </View>
        
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.notificationOption}>
            <Text style={styles.optionLabel}>Use default settings</Text>
            <View style={styles.toggleSwitch}>
              <View style={styles.toggleKnob} />
            </View>
          </View>
          
          <TouchableOpacity style={[styles.notificationOption, styles.disabledOption]}>
            <Text style={[styles.optionLabel, styles.disabledText]}>
              Custom reminder (days before)
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
          </TouchableOpacity>
        </View>
        
        {/* Personal Message Template */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Message Template</Text>
          <View style={styles.templateInput}>
            <Text style={styles.templatePlaceholder}>
              Leave empty to use global template
            </Text>
          </View>
        </View>
        
        {/* Birthday Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Birthday Details</Text>
          <View style={styles.birthdayContainer}>
            <View style={styles.birthdayHeader}>
              <Text style={styles.birthdayIcon}>🎂</Text>
              <Text style={styles.birthdayLabel}>Birthday Date</Text>
            </View>
            <SegmentedDatePicker
              value={birthday.date}
              onChange={handleDateChange}
            />
            <Text style={styles.ageText}>
              Turning {turningAge} this year
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  header: {
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1d23',
    marginBottom: 16,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  colorOptionWrapper: {
    width: 48,
    height: 48,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionSelected: {
    transform: [{ scale: 1.1 }],
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#e2e8f0',
    borderRadius: 12,
  },
  uploadButtonText: {
    fontSize: 15,
    color: '#64748b',
  },
  notificationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  disabledOption: {
    opacity: 0.5,
  },
  optionLabel: {
    fontSize: 15,
    color: '#1a1d23',
  },
  disabledText: {
    color: '#94a3b8',
  },
  toggleSwitch: {
    width: 48,
    height: 28,
    backgroundColor: '#0891b2',
    borderRadius: 14,
    padding: 2,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    transform: [{ translateX: 20 }],
  },
  templateInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
  },
  templatePlaceholder: {
    fontSize: 15,
    color: '#94a3b8',
  },
  birthdayContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
  },
  birthdayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  birthdayIcon: {
    fontSize: 20,
  },
  birthdayLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1d23',
  },
  ageText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 12,
    textAlign: 'center',
  },
});