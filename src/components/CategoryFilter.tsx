import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { CATEGORIES } from '../data/mockData';
import { useHustleContext } from '../context/HustleContext';
import { CategoryId } from '../types';

export const CategoryFilter: React.FC = () => {
  const { selectedCategory, setSelectedCategory } = useHustleContext();

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.pill, isSelected && styles.selectedPill]}
              onPress={() => setSelectedCategory(cat.id as CategoryId)}
              activeOpacity={0.75}
            >
              <Text style={styles.icon}>{cat.icon}</Text>
              <Text style={[styles.label, isSelected && styles.selectedLabel]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedPill: {
    backgroundColor: '#059669', // Emerald Green
    borderColor: '#059669',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    fontSize: 14,
    marginRight: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  selectedLabel: {
    color: '#FFFFFF',
  },
});
