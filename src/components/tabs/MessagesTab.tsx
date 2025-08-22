import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Animated,
  Platform,
  Linking,
  Clipboard,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface MessagesTabProps {
  personName: string;
}

interface MessageTemplate {
  id: string;
  title: string;
  type: 'friend' | 'family' | 'colleague' | 'custom';
  message: string;
}

const defaultTemplates: MessageTemplate[] = [
  {
    id: '1',
    title: 'Friend Template',
    type: 'friend',
    message: 'Happy birthday {name}! Hope your day is filled with joy and laughter! 🎉',
  },
  {
    id: '2',
    title: 'Family Template',
    type: 'family',
    message: 'Happy birthday {name}! Love you so much and hope all your wishes come true! ❤️',
  },
  {
    id: '3',
    title: 'Colleague Template',
    type: 'colleague',
    message: 'Happy birthday {name}! Wishing you a wonderful day and a fantastic year ahead!',
  },
];

export default function MessagesTab({ personName }: MessagesTabProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('1');
  const [templates, setTemplates] = useState(defaultTemplates);
  const [reminderTime, setReminderTime] = useState('9:00 AM');
  const [showToast, setShowToast] = useState(false);
  const toastOpacity = React.useRef(new Animated.Value(0)).current;
  
  const firstName = personName.split(' ')[0];

  const formatPhoneNumber = (text: string) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/\D/g, '');
    
    // Format as US phone number
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    if (cleaned.length <= 10) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
  };

  const handlePhoneChange = (text: string) => {
    setPhoneNumber(formatPhoneNumber(text));
  };

  const selectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
  };

  const updateTemplateMessage = (templateId: string, newMessage: string) => {
    setTemplates(templates.map(template => 
      template.id === templateId 
        ? { ...template, message: newMessage }
        : template
    ));
  };

  const copyToClipboard = async (message: string) => {
    const personalizedMessage = message.replace('{name}', firstName);
    await Clipboard.setString(personalizedMessage);
    showToastMessage();
  };

  const showToastMessage = () => {
    setShowToast(true);
    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setShowToast(false));
  };

  const sendMessage = () => {
    if (!phoneNumber) {
      alert('Please enter a phone number');
      return;
    }

    const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
    if (!selectedTemplate) return;

    const personalizedMessage = selectedTemplate.message.replace('{name}', firstName);
    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    
    // Create SMS URL
    const smsUrl = Platform.OS === 'ios' 
      ? `sms:${cleanedNumber}&body=${encodeURIComponent(personalizedMessage)}`
      : `sms:${cleanedNumber}?body=${encodeURIComponent(personalizedMessage)}`;
    
    Linking.openURL(smsUrl).catch(() => {
      alert('Unable to open Messages app');
    });
  };

  const addCustomTemplate = () => {
    // Placeholder for custom template functionality
    alert('Custom template functionality coming soon!');
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'friend': return '#007aff';
      case 'family': return '#34c759';
      case 'colleague': return '#af52de';
      case 'custom': return '#ff9500';
      default: return '#8e8e93';
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={200}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Phone Number Input */}
        <View style={styles.phoneInputSection}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput
            style={styles.phoneInput}
            placeholder="+1 (555) 123-4567"
            placeholderTextColor="#c7c7cc"
            value={phoneNumber}
            onChangeText={handlePhoneChange}
            keyboardType="phone-pad"
          />
        </View>

        {/* Message Templates */}
        {templates.map((template) => (
          <TouchableOpacity
            key={template.id}
            style={[
              styles.templateCard,
              selectedTemplateId === template.id && styles.templateCardSelected
            ]}
            onPress={() => selectTemplate(template.id)}
            activeOpacity={0.7}
          >
            <View style={styles.templateHeader}>
              <View style={styles.templateTitle}>
                {selectedTemplateId === template.id && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark" size={14} color="#ffffff" />
                  </View>
                )}
                <Text style={styles.templateTitleText}>{template.title}</Text>
              </View>
              <View style={[styles.templateBadge, { backgroundColor: getBadgeColor(template.type) }]}>
                <Text style={styles.templateBadgeText}>
                  {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => copyToClipboard(template.message)}
              activeOpacity={0.8}
            >
              <TextInput
                style={styles.templateMessage}
                value={template.message}
                onChangeText={(text) => updateTemplateMessage(template.id, text)}
                multiline
                editable={true}
                onFocus={() => selectTemplate(template.id)}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        {/* Add Custom Template */}
        <TouchableOpacity 
          style={styles.addTemplateCard}
          onPress={addCustomTemplate}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color="#007aff" />
          <Text style={styles.addTemplateText}>Add Custom Template</Text>
        </TouchableOpacity>

        {/* Notification Settings */}
        <View style={styles.settingsSection}>
          <View style={styles.timePickerRow}>
            <Text style={styles.timePickerLabel}>Remind me at:</Text>
            <TouchableOpacity style={styles.timePicker}>
              <Text style={styles.timePickerText}>{reminderTime}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.proFeature}>
            <Text style={styles.proFeatureText}>Auto-send without notification (Pro)</Text>
            <View style={styles.toggle} />
          </View>
        </View>

        <Text style={styles.editNotice}>
          Editing for {firstName} only. Change defaults in Settings.
        </Text>
      </ScrollView>

      {/* Send Button */}
      <View style={styles.sendButtonContainer}>
        <TouchableOpacity onPress={sendMessage} activeOpacity={0.9}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sendButton}
          >
            <Text style={styles.sendButtonText}>Send Birthday Message Now</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Toast Message */}
      {showToast && (
        <Animated.View 
          style={[
            styles.toast,
            { opacity: toastOpacity }
          ]}
        >
          <Text style={styles.toastText}>Message copied to clipboard!</Text>
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  phoneInputSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 8,
    fontWeight: '500',
  },
  phoneInput: {
    padding: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#e5e5e7',
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  templateCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  templateCardSelected: {
    borderColor: '#007aff',
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  templateTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkmark: {
    width: 20,
    height: 20,
    backgroundColor: '#007aff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  templateBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  templateBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  templateMessage: {
    fontSize: 15,
    lineHeight: 22,
    color: '#3c3c43',
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f9f9f9',
    minHeight: 60,
  },
  addTemplateCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#c7c7cc',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addTemplateText: {
    color: '#007aff',
    fontSize: 16,
    fontWeight: '500',
  },
  settingsSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timePickerLabel: {
    fontSize: 16,
    color: '#1c1c1e',
  },
  timePicker: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e5e7',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  timePickerText: {
    fontSize: 16,
    color: '#007aff',
    fontWeight: '500',
  },
  proFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  proFeatureText: {
    fontSize: 14,
    color: '#8e8e93',
  },
  toggle: {
    width: 51,
    height: 31,
    backgroundColor: '#e5e5e7',
    borderRadius: 31,
    opacity: 0.5,
  },
  editNotice: {
    textAlign: 'center',
    fontSize: 12,
    color: '#8e8e93',
    marginTop: 8,
  },
  sendButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e7',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  sendButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 6,
  },
  sendButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
  },
  toast: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    backgroundColor: '#1c1c1e',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  toastText: {
    color: '#ffffff',
    fontSize: 14,
  },
});