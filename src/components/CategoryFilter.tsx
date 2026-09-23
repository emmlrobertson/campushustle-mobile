import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet, View, TextInput } from 'react-native';
import { CATEGORIES } from '../data/mockData';
import { useHustleContext } from '../context/HustleContext';
import { CategoryId } from '../types';
import { colors } from '../theme/colors';

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
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.pill, isSelected && styles.selectedPill]}
              onPress={() => handleSelect(cat.id as CategoryId)}
              activeOpacity={0.8}
            >
              <Text style={styles.icon}>{cat.icon}</Text>
              <Text style={[styles.label, isSelected && styles.selectedLabel]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* 'Other' Pill with Dynamic Custom Filter Support from Figma */}
        <TouchableOpacity
          style={[styles.pill, isOtherActive && styles.selectedPill]}
          onPress={handleToggleOther}
          activeOpacity={0.8}
        >
          <Text style={styles.icon}>⋯</Text>
          <Text style={[styles.label, isOtherActive && styles.selectedLabel]}>
            Other
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Slide-in custom category input from Figma */}
      {isOtherActive && (
        <View style={styles.customInputContainer}>
          <Text style={styles.customInputIcon}>✍️</Text>
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
              <Text style={styles.clearBtnText}>✕</Text>
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
    backgroundColor: colors.surfaceAlt, // #F3F4F6
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedPill: {
    backgroundColor: colors.primary, // #0D6535 Forest Green from Figma
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    fontSize: 13,
    marginRight: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  selectedLabel: {
    color: colors.textWhite,
  },
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  customInputIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  customInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
    padding: 0,
  },
  clearBtn: {
    padding: 4,
  },
  clearBtnText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '700',
  },
});
