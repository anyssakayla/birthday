import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SegmentedDatePickerProps {
  value: string; // ISO date string YYYY-MM-DD
  onChange: (date: string) => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1920 + 1 }, (_, i) => CURRENT_YEAR - i);

export default function SegmentedDatePicker({ value, onChange }: SegmentedDatePickerProps) {
  const date = new Date(value);
  const [selectedMonth, setSelectedMonth] = useState(date.getMonth());
  const [selectedDay, setSelectedDay] = useState(date.getDate());
  const [selectedYear, setSelectedYear] = useState(date.getFullYear());
  const [activeModal, setActiveModal] = useState<'month' | 'day' | 'year' | null>(null);
  const isInitialMount = useRef(true);
  
  // Calculate days in month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const DAYS = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Adjust day if it exceeds days in month
  useEffect(() => {
    if (selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  }, [selectedMonth, selectedYear, daysInMonth, selectedDay]);
  
  // Update parent when any part changes
  useEffect(() => {
    // Skip the first render to prevent initial onChange call
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    const newDate = new Date(selectedYear, selectedMonth, selectedDay);
    const isoString = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    
    // Only call onChange if the date actually changed
    if (isoString !== value) {
      onChange(isoString);
    }
  }, [selectedMonth, selectedDay, selectedYear, value, onChange]);
  
  const renderPickerModal = () => {
    if (!activeModal) return null;
    
    let items: (string | number)[] = [];
    let selectedIndex = 0;
    
    switch (activeModal) {
      case 'month':
        items = MONTHS;
        selectedIndex = selectedMonth;
        break;
      case 'day':
        items = DAYS;
        selectedIndex = selectedDay - 1;
        break;
      case 'year':
        items = YEARS;
        selectedIndex = YEARS.indexOf(selectedYear);
        break;
    }
    
    return (
      <Modal
        visible={true}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setActiveModal(null)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select {activeModal.charAt(0).toUpperCase() + activeModal.slice(1)}
              </Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={24} color="#475569" />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={styles.pickerScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.pickerScrollContent}
            >
              {items.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.pickerItem,
                    index === selectedIndex && styles.pickerItemSelected
                  ]}
                  onPress={() => {
                    switch (activeModal) {
                      case 'month':
                        setSelectedMonth(index);
                        break;
                      case 'day':
                        setSelectedDay(index + 1);
                        break;
                      case 'year':
                        setSelectedYear(item as number);
                        break;
                    }
                    setActiveModal(null);
                  }}
                >
                  <Text style={[
                    styles.pickerItemText,
                    index === selectedIndex && styles.pickerItemTextSelected
                  ]}>
                    {item}
                  </Text>
                  {index === selectedIndex && (
                    <Ionicons name="checkmark" size={20} color="#0891b2" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    );
  };
  
  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.dropdown}
          onPress={() => setActiveModal('month')}
          activeOpacity={0.7}
        >
          <Text style={styles.dropdownText}>{MONTHS[selectedMonth]}</Text>
          <Ionicons name="chevron-down" size={16} color="#64748b" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.dropdown, styles.dropdownSmall]}
          onPress={() => setActiveModal('day')}
          activeOpacity={0.7}
        >
          <Text style={styles.dropdownText}>{selectedDay}</Text>
          <Ionicons name="chevron-down" size={16} color="#64748b" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.dropdown}
          onPress={() => setActiveModal('year')}
          activeOpacity={0.7}
        >
          <Text style={styles.dropdownText}>{selectedYear}</Text>
          <Ionicons name="chevron-down" size={16} color="#64748b" />
        </TouchableOpacity>
      </View>
      
      {renderPickerModal()}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
  },
  dropdown: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 44,
  },
  dropdownSmall: {
    flex: 0,
    minWidth: 70,
  },
  dropdownText: {
    fontSize: 15,
    color: '#1a1d23',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 34, // Safe area padding
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1d23',
  },
  pickerScroll: {
    flex: 1,
  },
  pickerScrollContent: {
    paddingVertical: 8,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  pickerItemSelected: {
    backgroundColor: '#f0f9ff',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#475569',
  },
  pickerItemTextSelected: {
    color: '#0891b2',
    fontWeight: '600',
  },
});