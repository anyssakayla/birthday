import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';

import { RootStackParamList } from '@/navigation/AppNavigator';
import { useTemplateStore, MessageTemplate } from '@/stores/templateStore';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Templates'>;

export default function TemplatesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { templates, loadTemplates, updateTemplate } = useTemplateStore();
  
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [editedMessage, setEditedMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleEditTemplate = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setEditedMessage(template.message);
  };

  const handleSaveTemplate = async () => {
    if (editingTemplate) {
      await updateTemplate(editingTemplate.id, editedMessage);
      setEditingTemplate(null);
      Alert.alert('Success', 'Template updated successfully!');
    }
  };

  const handleCancelEdit = () => {
    setEditingTemplate(null);
    setEditedMessage('');
  };

  const getPreviewMessage = (message: string) => {
    return message
      .replace(/{name}/g, 'John')
      .replace(/{age}/g, '25')
      .replace(/{relationship}/g, 'friend');
  };

  const renderTemplateCard = (template: MessageTemplate) => {
    const preview = template.message.split('\n').slice(0, 2).join('\n');
    const truncatedPreview = preview.length > 80 ? preview.substring(0, 80) + '...' : preview;

    return (
      <TouchableOpacity
        key={template.id}
        style={styles.templateCard}
        onPress={() => handleEditTemplate(template)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.templateIcon}>{template.icon}</Text>
          <Text style={styles.templateTitle}>{template.title}</Text>
        </View>
        <Text style={styles.templatePreview}>{truncatedPreview}</Text>
        <Text style={styles.editHint}>Tap to edit →</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Message Templates</Text>
          
          <View style={{ width: 40 }} />
        </View>
        
        <Text style={styles.headerSubtitle}>Customize your birthday messages</Text>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.templatesContainer}>
          {templates.map(renderTemplateCard)}
        </View>
        
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Available Variables</Text>
          <View style={styles.variablesList}>
            <View style={styles.variableChip}>
              <Text style={styles.variableText}>{'{name}'}</Text>
            </View>
            <View style={styles.variableChip}>
              <Text style={styles.variableText}>{'{age}'}</Text>
            </View>
            <View style={styles.variableChip}>
              <Text style={styles.variableText}>{'{relationship}'}</Text>
            </View>
          </View>
          <Text style={styles.infoText}>
            Use these variables in your templates and they'll be automatically replaced with the person's information.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={!!editingTemplate}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCancelEdit}
      >
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <SafeAreaView style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCancelEdit}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>
              Edit {editingTemplate?.title} Template
            </Text>
            
            <TouchableOpacity onPress={handleSaveTemplate}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </SafeAreaView>

          <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
            <View style={styles.variablesSection}>
              <Text style={styles.variablesSectionTitle}>Available Variables</Text>
              <View style={styles.variablesList}>
                <TouchableOpacity 
                  style={styles.variableChip}
                  onPress={() => setEditedMessage(editedMessage + '{name}')}
                >
                  <Text style={styles.variableText}>{'{name}'}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.variableChip}
                  onPress={() => setEditedMessage(editedMessage + '{age}')}
                >
                  <Text style={styles.variableText}>{'{age}'}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.variableChip}
                  onPress={() => setEditedMessage(editedMessage + '{relationship}')}
                >
                  <Text style={styles.variableText}>{'{relationship}'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.editorSection}>
              <Text style={styles.editorLabel}>Message Template</Text>
              <TextInput
                style={styles.messageInput}
                value={editedMessage}
                onChangeText={setEditedMessage}
                multiline
                textAlignVertical="top"
                placeholder="Type your message here..."
              />
            </View>

            <TouchableOpacity 
              style={styles.previewButton}
              onPress={() => setShowPreview(!showPreview)}
            >
              <Text style={styles.previewButtonText}>
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </Text>
            </TouchableOpacity>

            {showPreview && (
              <View style={styles.previewSection}>
                <Text style={styles.previewLabel}>Preview</Text>
                <View style={styles.previewCard}>
                  <Text style={styles.previewText}>
                    {getPreviewMessage(editedMessage)}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#007aff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1c1c1e',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8e8e93',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
  },
  templatesContainer: {
    padding: 20,
    gap: 16,
  },
  templateCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  templateIcon: {
    fontSize: 32,
  },
  templateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  templatePreview: {
    fontSize: 14,
    color: '#8e8e93',
    lineHeight: 20,
    marginBottom: 12,
  },
  editHint: {
    fontSize: 14,
    color: '#007aff',
    fontWeight: '500',
  },
  infoSection: {
    margin: 20,
    padding: 20,
    backgroundColor: '#f0f0f2',
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 12,
  },
  variablesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  variableChip: {
    backgroundColor: '#007aff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  variableText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  infoText: {
    fontSize: 14,
    color: '#6e6e73',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalCancel: {
    fontSize: 17,
    color: '#007aff',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1c1c1e',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  modalSave: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007aff',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  variablesSection: {
    marginBottom: 24,
  },
  variablesSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8e8e93',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  editorSection: {
    marginBottom: 20,
  },
  editorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8e8e93',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  messageInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1c1c1e',
    minHeight: 200,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  previewButton: {
    backgroundColor: '#007aff',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  previewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  previewSection: {
    marginBottom: 20,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8e8e93',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  previewText: {
    fontSize: 16,
    color: '#1c1c1e',
    lineHeight: 24,
  },
});