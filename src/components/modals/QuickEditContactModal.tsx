import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import { Birthday } from '@/types';
import { RELATIONSHIP_COLORS, CUSTOM_COLOR } from '@/constants/colors';
import { useTemplateStore } from '@/stores/templateStore';
import { useBirthdayStore } from '@/stores/birthdayStore';
import SegmentedDatePickerInline from '@/components/ui/SegmentedDatePickerInline';

const { height: screenHeight } = Dimensions.get('window');
const MODAL_HEIGHT = screenHeight * 0.65; // Reasonable height with inline picker

interface QuickEditContactModalProps {
  visible: boolean;
  birthday: Birthday | null;
  onClose: () => void;
  onSave: (updatedStatus: string) => void;
}

type StatusType = 'friend' | 'family' | 'colleague' | 'custom';

export default function QuickEditContactModal({
  visible,
  birthday,
  onClose,
  onSave,
}: QuickEditContactModalProps) {
  const { templates } = useTemplateStore();
  const { updateBirthday } = useBirthdayStore();
  
  const [selectedStatus, setSelectedStatus] = useState<StatusType>('friend');
  const [isExpanded, setIsExpanded] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  
  const slideAnim = useRef(new Animated.Value(MODAL_HEIGHT)).current;
  const expandAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  
  useEffect(() => {
    if (birthday) {
      setSelectedStatus((birthday.metadata?.templateType || birthday.metadata?.relationship || 'friend') as StatusType);
      setCustomMessage(birthday.metadata?.customMessage || '');
      setPhoneNumber(birthday.metadata?.phoneNumber || '');
      setBirthDate(birthday.date);
    }
  }, [birthday]);
  
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: MODAL_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);
  
  const handleStatusPress = (status: StatusType) => {
    if (selectedStatus === status) {
      // Toggle expand/collapse
      toggleExpand();
    } else {
      // Change status and expand
      setSelectedStatus(status);
      if (!isExpanded) {
        toggleExpand();
      }
    }
  };
  
  const toggleExpand = () => {
    const toValue = isExpanded ? 0 : 1;
    setIsExpanded(!isExpanded);
    
    Animated.spring(expandAnim, {
      toValue,
      useNativeDriver: false,
      tension: 65,
      friction: 11,
    }).start();
  };
  
  const handleSave = async () => {
    if (!birthday) return;
    
    await updateBirthday(birthday.id, {
      date: birthDate,
      metadata: {
        ...birthday.metadata,
        relationship: selectedStatus === 'custom' ? 'friend' : selectedStatus,
        templateType: selectedStatus,
        customMessage: selectedStatus === 'custom' ? customMessage : birthday.metadata?.customMessage,
        phoneNumber,
      },
    });
    
    onSave(selectedStatus);
    onClose();
  };
  
  const getTemplateMessage = () => {
    if (selectedStatus === 'custom') {
      return customMessage;
    }
    
    const template = templates.find(t => t.id === selectedStatus);
    return template?.message.replace(/{name}/g, birthday?.name || '') || '';
  };
  
  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case 'friend':
        return RELATIONSHIP_COLORS.friend;
      case 'family':
        return RELATIONSHIP_COLORS.family;
      case 'colleague':
        return RELATIONSHIP_COLORS.colleague;
      case 'custom':
        return CUSTOM_COLOR;
    }
  };
  
  if (!birthday) return null;
  
  const expandHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 180],
  });
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      presentationStyle="overFullScreen"
    >
      <BlurView intensity={20} style={styles.backdrop}>
        <TouchableOpacity style={styles.backdropTouch} onPress={onClose} activeOpacity={1} />
      </BlurView>
      
      <Animated.View
        style={[
          styles.modalContainer,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.handle} />
          
          <View style={styles.header}>
            <Text style={styles.contactName}>{birthday.name}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#8e8e93" />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            ref={scrollViewRef}
            style={styles.content} 
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Relationship & Message Template</Text>
              
              <View style={styles.statusButtons}>
                {(['friend', 'family', 'colleague', 'custom'] as StatusType[]).map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusButton,
                      selectedStatus === status && [
                        styles.statusButtonActive,
                        { 
                          backgroundColor: getStatusColor(status) + '15',
                          borderColor: getStatusColor(status),
                        }
                      ]
                    ]}
                    onPress={() => handleStatusPress(status)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        selectedStatus === status && { color: getStatusColor(status) }
                      ]}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Animated.View style={[styles.previewContainer, { height: expandHeight }]}>
                {isExpanded && (
                  <View
                    style={[
                      styles.previewContent,
                      {
                        backgroundColor: 
                          selectedStatus === 'custom' 
                            ? '#f8f9fa' 
                            : getStatusColor(selectedStatus) + '08'
                      }
                    ]}
                  >
                    {selectedStatus === 'custom' ? (
                      <TextInput
                        style={styles.customInput}
                        value={customMessage}
                        onChangeText={setCustomMessage}
                        multiline
                        placeholder={`Write a custom birthday message for ${birthday.name}...`}
                        placeholderTextColor="#8e8e93"
                      />
                    ) : (
                      <Text style={styles.previewText}>{getTemplateMessage()}</Text>
                    )}
                  </View>
                )}
              </Animated.View>
            </View>
            
            <View style={[styles.section, styles.birthdaySection]}>
              <Text style={styles.sectionTitle}>Birthday</Text>
              <View style={styles.datePickerContainer}>
                <SegmentedDatePickerInline
                  value={birthDate}
                  onChange={setBirthDate}
                />
              </View>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Phone Number (Optional)</Text>
              <TextInput
                style={styles.phoneInput}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Add phone number"
                placeholderTextColor="#8e8e93"
                keyboardType="phone-pad"
              />
            </View>
          </ScrollView>
          
          <View style={styles.footer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropTouch: {
    flex: 1,
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: MODAL_HEIGHT,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  keyboardView: {
    flex: 1,
  },
  handle: {
    width: 36,
    height: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  contactName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentContainer: {
    paddingBottom: 150, // Extra padding to ensure date picker is visible
  },
  section: {
    paddingVertical: 16,
  },
  birthdaySection: {
    minHeight: 100, // Ensure enough space for the date picker
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8e8e93',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  statusButtonActive: {
    // Styles applied inline with color
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  previewContainer: {
    overflow: 'hidden',
    marginTop: 12,
  },
  previewContent: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
  },
  previewText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1c1c1e',
  },
  customInput: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1c1c1e',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  datePickerContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 4,
  },
  phoneInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1c1c1e',
  },
  footer: {
    padding: 20,
    paddingBottom: 34, // For iPhone X and newer
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  saveButton: {
    backgroundColor: '#007aff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
  },
});