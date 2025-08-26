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
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList } from '@/navigation/AppNavigator';
import { useTemplateStore, MessageTemplate } from '@/stores/templateStore';
import { RELATIONSHIP_COLORS } from '@/constants/colors';

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
    const preview = template.message.split('\n').slice(0, 4).join('\n');
    const truncatedPreview = preview.length > 150 ? preview.substring(0, 150) + '...' : preview;

    return (
      <View key={template.id} style={styles.templateSection}>
        <Text style={[styles.templateTitle, { color: template.color }]}>
          {template.title}
        </Text>
        <TouchableOpacity
          style={[styles.templateCard, { borderColor: template.color }]}
          onPress={() => handleEditTemplate(template)}
          activeOpacity={0.7}
        >
          <Text style={styles.templatePreview}>{truncatedPreview}</Text>
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: template.color + '15' }]}
            onPress={() => handleEditTemplate(template)}
          >
            <Ionicons name="pencil" size={16} color={template.color} />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
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
            <View style={styles.modalHeaderContent}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={handleCancelEdit}
              >
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              
              <Text style={styles.modalTitle}>
                Edit {editingTemplate?.title} Template
              </Text>
              
              <TouchableOpacity 
                style={[styles.modalSaveButton, { backgroundColor: editingTemplate?.color || '#007aff' }]}
                onPress={handleSaveTemplate}
              >
                <Text style={styles.modalSave}>Save</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
            <View style={styles.variablesSection}>
              <Text style={styles.variablesSectionTitle}>Available Variables</Text>
              <View style={styles.variablesList}>
                <TouchableOpacity 
                  style={[styles.variableChip, { backgroundColor: editingTemplate?.color || '#007aff' }]}
                  onPress={() => setEditedMessage(editedMessage + '{name}')}
                >
                  <Text style={styles.variableText}>{'{name}'}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.variableChip, { backgroundColor: editingTemplate?.color || '#007aff' }]}
                  onPress={() => setEditedMessage(editedMessage + '{age}')}
                >
                  <Text style={styles.variableText}>{'{age}'}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.variableChip, { backgroundColor: editingTemplate?.color || '#007aff' }]}
                  onPress={() => setEditedMessage(editedMessage + '{relationship}')}
                >
                  <Text style={styles.variableText}>{'{relationship}'}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.variableInfoText}>
                Use these variables in your templates and they'll be automatically replaced with the person's information.
              </Text>
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
              style={[styles.previewButton, { backgroundColor: editingTemplate?.color || '#007aff' }]}
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
  },
  templateSection: {
    marginBottom: 24,
  },
  templateTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 4,
  },
  templateCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
    minHeight: 120,
    borderWidth: 1.5,
  },
  templatePreview: {
    fontSize: 15,
    color: '#1c1c1e',
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  editButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    paddingBottom: 16,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  modalCancelButton: {
    padding: 8,
    minWidth: 60,
  },
  modalCancel: {
    fontSize: 17,
    color: '#8e8e93',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1c1c1e',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  modalSaveButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
    minWidth: 50,
    alignItems: 'center',
  },
  modalSave: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
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
  variableInfoText: {
    fontSize: 13,
    color: '#6e6e73',
    lineHeight: 18,
    marginTop: 4,
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