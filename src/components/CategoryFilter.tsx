import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet, View, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES } from '../data/mockData';
import { useHustleContext } from '../context/HustleContext';
import { CategoryId } from '../types';
import { colors } from '../theme/colors';

const CATEGORY_ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  all: 'compass-outline',
  tutoring: 'book-outline',
  tech_repair: 'laptop-outline',
  food_delivery: 'restaurant-outline',
  photo_video: 'camera-outline',
  fashion_beauty: 'cut-outline',
  laundry_errands: 'cube-outline',
  custom: 'brush-outline',
};

export const CategoryFilter: React.FC = () => {
  const { selectedCategory, setSelectedCategory, setSearchQuery } = useHustleContext();
  const [isOtherActive, setIsOtherActive] = useState(false);
  const [customCategoryText, setCustomCategoryText] = useState('');

  const handleSelect = (catId: CategoryId) => {
    setIsOtherActive(false);
    setSelectedCategory(catId);
  };

  const handleToggleOther = () => {
    if (isOtherActive) {
      setIsOtherActive(false);
      setSelectedCategory('all');
    } else {
      setIsOtherActive(true);
      setSelectedCategory('all');
    }
  };

  const handleCustomCategorySubmit = (text: string) => {
    setCustomCategoryText(text);
    setSearchQuery(text.trim());
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {CATEGORIES.map((cat) => {
          const isSelected = !isOtherActive && selectedCategory === cat.id;
          const iconName = CATEGORY_ICON_MAP[cat.id] || 'apps-outline';
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.pill, isSelected ? styles.selectedPill : styles.unselectedPill]}
              onPress={() => handleSelect(cat.id as CategoryId)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={iconName}
                size={16}
                color={isSelected ? '#FFFFFF' : '#475569'}
                style={styles.pillIcon}
              />
              <Text style={[styles.label, isSelected ? styles.selectedLabel : styles.unselectedLabel]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* 'Other' Pill */}
        <TouchableOpacity
          style={[styles.pill, isOtherActive ? styles.selectedPill : styles.unselectedPill]}
          onPress={handleToggleOther}
          activeOpacity={0.8}
        >
          <Ionicons
            name="ellipsis-horizontal"
            size={16}
            color={isOtherActive ? '#FFFFFF' : '#475569'}
            style={styles.pillIcon}
          />
          <Text style={[styles.label, isOtherActive ? styles.selectedLabel : styles.unselectedLabel]}>
            Other
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Custom category input */}
      {isOtherActive && (
        <View style={styles.customInputContainer}>
          <Ionicons name="search-outline" size={16} color={colors.textMuted} style={styles.customInputIcon} />
          <TextInput
            style={styles.customInput}
            placeholder="Type custom skill / service (e.g. Catering, DJ, Nails)..."
            placeholderTextColor={colors.textMuted}
            value={customCategoryText}
            onChangeText={handleCustomCategorySubmit}
            autoFocus
          />
          {customCategoryText !== '' && (
            <TouchableOpacity onPress={() => handleCustomCategorySubmit('')} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 10,
  },
  container: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1,
  },
  unselectedPill: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  selectedPill: {
    backgroundColor: colors.primary, // #059669
    borderColor: colors.primary,
  },
  pillIcon: {
    marginRight: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
  unselectedLabel: {
    color: '#334155',
  },
  selectedLabel: {
    color: '#FFFFFF',
  },
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  customInputIcon: {
    marginRight: 8,
  },
  customInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '500',
    padding: 0,
  },
  clearBtn: {
    padding: 4,
  },
});
