import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';

interface MessagesTabProps {
  personName: string;
}

export default function MessagesTab({ personName }: MessagesTabProps) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.messagesContainer}>
        <Text style={styles.comingSoon}>Birthday Messages Coming Soon!</Text>
        <Text style={styles.comingSoonSubtext}>
          Create and save birthday message templates for {personName.split(' ')[0]}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  messagesContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    paddingTop: 100,
  },
  comingSoon: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 12,
    textAlign: 'center',
  },
  comingSoonSubtext: {
    fontSize: 16,
    color: '#8e8e93',
    textAlign: 'center',
    lineHeight: 24,
  },
});