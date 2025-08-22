import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

interface GiftsTabProps {
  notes: string;
  personName: string;
}

const { width: screenWidth } = Dimensions.get("window");

interface GiftCard {
  name: string;
  icon: string;
  backgroundColor: string;
  textColor: string;
}

const GIFT_CARDS: GiftCard[] = [
  {
    name: "Amazon",
    icon: "🛍️",
    backgroundColor: "#232F3E",
    textColor: "#ffffff",
  },
  {
    name: "Target",
    icon: "🎯",
    backgroundColor: "#CC0000",
    textColor: "#ffffff",
  },
  {
    name: "Visa",
    icon: "💳",
    backgroundColor: "#1A1F71",
    textColor: "#ffffff",
  },
  {
    name: "Starbucks",
    icon: "☕",
    backgroundColor: "#00704A",
    textColor: "#ffffff",
  },
  { name: "Spa", icon: "💆", backgroundColor: "#8B4789", textColor: "#ffffff" },
  {
    name: "iTunes",
    icon: "🎵",
    backgroundColor: "#FC3C44",
    textColor: "#ffffff",
  },
];

export default function GiftsTab({ notes, personName }: GiftsTabProps) {
  const [giftIdeas, setGiftIdeas] = useState("");
  const [useNotes, setUseNotes] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasEditedNotes, setHasEditedNotes] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const switchAnimation = useRef(new Animated.Value(0)).current;
  const firstName = personName.split(" ")[0];

  // Truncate notes for display
  const truncateNotes = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const toggleSwitch = () => {
    const newValue = !useNotes;
    setUseNotes(newValue);

    Animated.timing(switchAnimation, {
      toValue: newValue ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    if (newValue && notes) {
      // Toggle ON - Load truncated notes
      setGiftIdeas(isInputFocused ? notes : truncateNotes(notes));
      setHasEditedNotes(false);
    } else {
      // Toggle OFF - Clear
      setGiftIdeas("");
      setHasEditedNotes(false);
    }
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
    // If using notes and showing truncated version, show full notes
    if (useNotes && giftIdeas === truncateNotes(notes)) {
      setGiftIdeas(notes);
    }
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
    // If still using original notes, show truncated version
    if (useNotes && giftIdeas === notes && !hasEditedNotes) {
      setGiftIdeas(truncateNotes(notes));
    }
  };

  const handleInputChange = (text: string) => {
    setGiftIdeas(text);

    // Check if user has edited the imported notes
    if (useNotes && text !== notes && text !== truncateNotes(notes)) {
      setHasEditedNotes(true);
    }
  };

  const handleGenerateGifts = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      Alert.alert(
        "Gift Ideas Generated!",
        "Personalized gift suggestions based on notes and preferences.",
        [{ text: "OK" }]
      );
    }, 1500);
  };

  const handleGiftCardPress = (card: GiftCard) => {
    Alert.alert(
      `${card.name} Gift Card`,
      `Purchase a ${card.name} gift card for ${firstName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Buy Now",
          onPress: () => console.log(`Buying ${card.name} gift card`),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={["#f0f4ff", "#f9f0ff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.giftGenerator}
      >
        <Text style={styles.generatorTitle}>Personalized Gifts</Text>

        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.minimalInput,
              useNotes && !hasEditedNotes && styles.inputHasNotes,
              hasEditedNotes && styles.inputEdited,
            ]}
            placeholder="Specific ideas..."
            placeholderTextColor="#c7c7cc"
            value={giftIdeas}
            onChangeText={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            textAlign="center"
          />
          {useNotes && (
            <Text style={styles.notesIndicator}>
              {!notes
                ? "No notes in notes tab"
                : hasEditedNotes
                ? "Notes customized for this gift search"
                : "Using notes • Tap to customize"}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.switchContainer}
          onPress={toggleSwitch}
          activeOpacity={0.8}
        >
          <Text style={styles.switchLabel}>Use {firstName}'s notes</Text>
          <View style={[styles.switch, useNotes && styles.switchActive]}>
            <Animated.View
              style={[
                styles.switchKnob,
                {
                  transform: [
                    {
                      translateX: switchAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [2, 22],
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.generateButton,
            isGenerating && styles.generateButtonLoading,
          ]}
          onPress={handleGenerateGifts}
          disabled={isGenerating}
        >
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.generateButtonGradient}
          >
            <Text style={styles.generateButtonText}>
              {isGenerating ? "Generating..." : "Generate Ideas"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {useNotes && (
          <View style={styles.editWarning}>
            <Text style={styles.editWarningText}>
              Changes here won't update {firstName}'s saved notes
            </Text>
          </View>
        )}
      </LinearGradient>

      {/* Notes Preview Section */}
      {notes && (
        <View style={styles.notesPreview}>
          <Text style={styles.notesPreviewTitle}>
            {firstName}'s Saved Notes:
          </Text>
          <Text style={styles.notesPreviewText}>{notes}</Text>
        </View>
      )}

      <View style={styles.giftCardsSection}>
        <Text style={styles.sectionTitle}>Quick Gift Cards</Text>
        <View style={styles.giftCardsGrid}>
          {GIFT_CARDS.map((card) => (
            <TouchableOpacity
              key={card.name}
              style={[
                styles.giftCardItem,
                { backgroundColor: card.backgroundColor },
              ]}
              onPress={() => handleGiftCardPress(card)}
              activeOpacity={0.8}
            >
              <View style={styles.giftCardContent}>
                <Text style={styles.giftCardIcon}>{card.icon}</Text>
                <Text style={[styles.giftCardText, { color: card.textColor }]}>
                  {card.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity 
          style={styles.seeMoreButton}
          onPress={() => Alert.alert('See More', 'More gift cards coming soon!')}
          activeOpacity={0.7}
        >
          <Text style={styles.seeMoreButtonText}>See More</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f7",
  },
  giftGenerator: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 8,
  },
  generatorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1c1c1e",
    marginBottom: 20,
    textAlign: "center",
  },
  inputWrapper: {
    marginBottom: 20,
  },
  minimalInput: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#667eea",
    fontSize: 16,
    color: "#1c1c1e",
    backgroundColor: "transparent",
    textAlign: "center",
  },
  inputHasNotes: {
    fontStyle: "italic",
    color: "#667eea",
  },
  inputEdited: {
    fontStyle: "normal",
    color: "#1c1c1e",
  },
  notesIndicator: {
    fontSize: 12,
    color: "#667eea",
    marginTop: 8,
    textAlign: "center",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 24,
  },
  switchLabel: {
    fontSize: 14,
    color: "#1c1c1e",
  },
  switch: {
    width: 48,
    height: 28,
    backgroundColor: "#e5e5e7",
    borderRadius: 14,
    padding: 2,
  },
  switchActive: {
    backgroundColor: "#667eea",
  },
  switchKnob: {
    width: 24,
    height: 24,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  generateButton: {
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  generateButtonLoading: {
    opacity: 0.7,
  },
  generateButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  editWarning: {
    marginTop: 8,
    alignItems: "center",
  },
  editWarningIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  editWarningText: {
    fontSize: 11,
    color: "#8e8e93",
    textAlign: "center",
  },
  notesPreview: {
    backgroundColor: "#f0f0f2",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  notesPreviewTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  notesPreviewText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 20,
  },
  giftCardsSection: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8e8e93",
    textAlign: "center",
    marginBottom: 16,
  },
  giftCardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  },
  giftCardItem: {
    width: (screenWidth - 80 - 24) / 3, // screenWidth - total padding (80) - gaps (24)
    height: 90,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  giftCardContent: {
    alignItems: "center",
    gap: 8,
  },
  giftCardIcon: {
    fontSize: 32,
  },
  giftCardText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  seeMoreButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'center',
  },
  seeMoreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
});
