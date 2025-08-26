import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SegmentedDatePickerInlineProps {
  value: string; // ISO date string YYYY-MM-DD or 0000-MM-DD for no year
  onChange: (date: string) => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = ['No Year', ...Array.from({ length: CURRENT_YEAR - 1920 + 1 }, (_, i) => CURRENT_YEAR - i)];

export default function SegmentedDatePickerInline({ value, onChange }: SegmentedDatePickerInlineProps) {
  // Parse the date, handling the case where year might be 0000
  const hasYear = !value.startsWith('0000');
  const date = hasYear ? new Date(value) : new Date(value.replace('0000', '2000')); // Use 2000 as placeholder for parsing
  
  const [selectedMonth, setSelectedMonth] = useState(date.getMonth());
  const [selectedDay, setSelectedDay] = useState(date.getDate());
  const [selectedYear, setSelectedYear] = useState<number | null>(hasYear ? date.getFullYear() : null);
  const [expandedSection, setExpandedSection] = useState<'month' | 'day' | 'year' | null>(null);
  
  // Calculate days in month
  const getDaysInMonth = (month: number, year: number | null) => {
    // Use a leap year (2000) as default when no year is selected to allow Feb 29
    const yearToUse = year || 2000;
    return new Date(yearToUse, month + 1, 0).getDate();
  };
  
  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const DAYS = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Adjust day if it exceeds days in month
  useEffect(() => {
    if (selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  }, [selectedDay, daysInMonth]);
  
  // Update parent when selection changes
  useEffect(() => {
    const yearStr = selectedYear ? String(selectedYear) : '0000';
    const monthStr = String(selectedMonth + 1).padStart(2, '0');
    const dayStr = String(selectedDay).padStart(2, '0');
    const newDate = `${yearStr}-${monthStr}-${dayStr}`;
    
    if (newDate !== value) {
      onChange(newDate);
    }
  }, [selectedMonth, selectedDay, selectedYear]);
  
  const toggleSection = (section: 'month' | 'day' | 'year') => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  
  const renderExpandedContent = () => {
    if (!expandedSection) return null;
    
    let items: (string | number)[] = [];
    let selectedIndex = 0;
    
    switch (expandedSection) {
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
        selectedIndex = selectedYear ? YEARS.indexOf(selectedYear) : 0;
        break;
    }
    
    return (
      <View style={styles.expandedContainer}>
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
                switch (expandedSection) {
                  case 'month':
                    setSelectedMonth(index);
                    break;
                  case 'day':
                    setSelectedDay(index + 1);
                    break;
                  case 'year':
                    setSelectedYear(item === 'No Year' ? null : item as number);
                    break;
                }
                setExpandedSection(null);
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
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.dropdownRow}>
        <TouchableOpacity 
          style={[styles.dropdown, expandedSection === 'month' && styles.dropdownActive]}
          onPress={() => toggleSection('month')}
          activeOpacity={0.7}
        >
          <Text style={styles.dropdownText}>{MONTHS[selectedMonth]}</Text>
          <Ionicons 
            name={expandedSection === 'month' ? "chevron-up" : "chevron-down"} 
            size={16} 
            color="#64748b" 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.dropdown, styles.dropdownSmall, expandedSection === 'day' && styles.dropdownActive]}
          onPress={() => toggleSection('day')}
          activeOpacity={0.7}
        >
          <Text style={styles.dropdownText}>{selectedDay}</Text>
          <Ionicons 
            name={expandedSection === 'day' ? "chevron-up" : "chevron-down"} 
            size={16} 
            color="#64748b" 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.dropdown, expandedSection === 'year' && styles.dropdownActive]}
          onPress={() => toggleSection('year')}
          activeOpacity={0.7}
        >
          <Text style={[styles.dropdownText, !selectedYear && styles.placeholderText]}>
            {selectedYear || 'No Year'}
          </Text>
          <Ionicons 
            name={expandedSection === 'year' ? "chevron-up" : "chevron-down"} 
            size={16} 
            color="#64748b" 
          />
        </TouchableOpacity>
      </View>
      
      {renderExpandedContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  dropdownRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dropdown: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dropdownActive: {
    borderColor: '#0891b2',
    backgroundColor: '#f0f9ff',
  },
  dropdownSmall: {
    flex: 0,
    width: 80,
  },
  dropdownText: {
    fontSize: 15,
    color: '#1a1d23',
    fontWeight: '500',
  },
  placeholderText: {
    color: '#94a3b8',
  },
  expandedContainer: {
    marginTop: 8,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    maxHeight: 200,
  },
  pickerScroll: {
    maxHeight: 200,
  },
  pickerScrollContent: {
    paddingVertical: 4,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pickerItemSelected: {
    backgroundColor: '#f0f9ff',
  },
  pickerItemText: {
    fontSize: 15,
    color: '#64748b',
  },
  pickerItemTextSelected: {
    color: '#0891b2',
    fontWeight: '600',
  },
});