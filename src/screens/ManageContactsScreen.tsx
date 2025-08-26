import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  StatusBar,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

import { RootStackParamList } from '@/navigation/AppNavigator';
import { useBirthdayStore } from '@/stores/birthdayStore';
import { useTemplateStore } from '@/stores/templateStore';
import { Birthday } from '@/types';
import { RELATIONSHIP_COLORS } from '@/constants/colors';
import QuickEditContactModal from '@/components/modals/QuickEditContactModal';
import Toast from '@/components/ui/Toast';

type NavigationProp = StackNavigationProp<RootStackParamList, 'ManageContacts'>;

interface ContactItemProps {
  birthday: Birthday;
  isSelectMode: boolean;
  isSelected: boolean;
  onPress: () => void;
  onSelect: () => void;
}

const ContactItem: React.FC<ContactItemProps> = ({
  birthday,
  isSelectMode,
  isSelected,
  onPress,
  onSelect,
}) => {
  const scaleAnim = new Animated.Value(1);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (isSelectMode) {
        onSelect();
      } else {
        onPress();
      }
    });
  };

  const getDaysUntilBirthday = (dateString: string) => {
    const today = new Date();
    const birthDate = new Date(dateString);
    const currentYear = today.getFullYear();
    
    // Create birthday this year
    let birthdayThisYear = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
    
    // If birthday has passed this year, use next year
    if (birthdayThisYear < today) {
      birthdayThisYear = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
    }
    
    const diffTime = birthdayThisYear.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today!';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays <= 30) return `In ${Math.round(diffDays / 7)} weeks`;
    return format(birthdayThisYear, 'MMM d');
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.contactItem, isSelected && styles.contactItemSelected]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {isSelectMode && (
          <View style={styles.checkboxContainer}>
            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
              {isSelected && <Ionicons name="checkmark" size={16} color="#ffffff" />}
            </View>
          </View>
        )}
        
        <View style={styles.contactInfo}>
          <View style={styles.contactHeader}>
            <Text style={styles.contactName}>{birthday.name}</Text>
            {birthday.metadata?.relationship && (
              <View
                style={[
                  styles.relationshipDot,
                  {
                    backgroundColor:
                      birthday.metadata.relationship === 'friend'
                        ? RELATIONSHIP_COLORS.friend
                        : birthday.metadata.relationship === 'family'
                        ? RELATIONSHIP_COLORS.family
                        : RELATIONSHIP_COLORS.colleague,
                  },
                ]}
              />
            )}
          </View>
          <Text style={styles.contactBirthday}>
            {format(new Date(birthday.date.replace('0000', new Date().getFullYear().toString())), 'MMMM d')} • {getDaysUntilBirthday(birthday.date)}
          </Text>
        </View>
        
        {!isSelectMode && (
          <Ionicons name="chevron-forward" size={20} color="#c7c7cc" />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function ManageContactsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { birthdays, deleteBirthday } = useBirthdayStore();
  const { loadTemplates } = useTemplateStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filteredBirthdays, setFilteredBirthdays] = useState<Birthday[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBirthday, setSelectedBirthday] = useState<Birthday | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    const filtered = birthdays.filter(birthday =>
      birthday.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredBirthdays(filtered);
  }, [birthdays, searchQuery]);

  const handleToggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    if (isSelectMode) {
      setSelectedIds(new Set());
    }
  };

  const handleSelectContact = (id: string) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }
    setSelectedIds(newSelectedIds);
  };

  const handleDeleteSelected = () => {
    const count = selectedIds.size;
    Alert.alert(
      'Delete Contacts',
      `Are you sure you want to delete ${count} contact${count > 1 ? 's' : ''}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            for (const id of selectedIds) {
              await deleteBirthday(id);
            }
            setSelectedIds(new Set());
            setIsSelectMode(false);
          },
        },
      ]
    );
  };

  const handleEditContact = (birthdayId: string) => {
    const birthday = birthdays.find(b => b.id === birthdayId);
    if (birthday) {
      setSelectedBirthday(birthday);
      setModalVisible(true);
    }
  };

  const handleModalSave = (updatedStatus: string) => {
    // Refresh is automatic since we're using zustand store
    setModalVisible(false);
    
    const typeText = updatedStatus.charAt(0).toUpperCase() + updatedStatus.slice(1);
    setToastMessage(`Contact updated. Using ${typeText} message template.`);
    setToastVisible(true);
  };

  const renderItem = ({ item }: { item: Birthday }) => (
    <ContactItem
      birthday={item}
      isSelectMode={isSelectMode}
      isSelected={selectedIds.has(item.id)}
      onPress={() => handleEditContact(item.id)}
      onSelect={() => handleSelectContact(item.id)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>🎂</Text>
      <Text style={styles.emptyStateTitle}>No Contacts Found</Text>
      <Text style={styles.emptyStateSubtitle}>
        {searchQuery ? 'Try a different search term' : 'Add some birthdays to get started!'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={28} color="#007aff" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Manage Contacts</Text>
          
          <TouchableOpacity
            style={styles.selectButton}
            onPress={handleToggleSelectMode}
          >
            <Text style={styles.selectButtonText}>
              {isSelectMode ? 'Cancel' : 'Select'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#8e8e93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts..."
            placeholderTextColor="#8e8e93"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
      </SafeAreaView>
      
      <FlatList
        data={filteredBirthdays}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={filteredBirthdays.length === 0 ? styles.emptyContainer : styles.listContent}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
      
      {isSelectMode && selectedIds.size > 0 && (
        <View style={styles.bottomToolbar}>
          <Text style={styles.selectedCount}>
            {selectedIds.size} selected
          </Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteSelected}
          >
            <Text style={styles.deleteButtonText}>
              Delete ({selectedIds.size})
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      <QuickEditContactModal
        visible={modalVisible}
        birthday={selectedBirthday}
        onClose={() => setModalVisible(false)}
        onSave={handleModalSave}
      />
      
      <Toast
        visible={toastVisible}
        message={toastMessage}
        onHide={() => setToastVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  selectButton: {
    padding: 4,
  },
  selectButtonText: {
    fontSize: 17,
    color: '#007aff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 12,
    height: 36,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1c1c1e',
  },
  listContent: {
    paddingVertical: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  contactItemSelected: {
    backgroundColor: '#f0f9ff',
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#c7c7cc',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxSelected: {
    backgroundColor: '#007aff',
    borderColor: '#007aff',
  },
  contactInfo: {
    flex: 1,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactName: {
    fontSize: 17,
    fontWeight: '500',
    color: '#1c1c1e',
  },
  relationshipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  contactBirthday: {
    fontSize: 14,
    color: '#8e8e93',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#8e8e93',
    textAlign: 'center',
  },
  bottomToolbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingBottom: 34, // For iPhone X and newer
    paddingTop: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedCount: {
    fontSize: 16,
    color: '#8e8e93',
  },
  deleteButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#ff3b30',
    borderRadius: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});