import React, { useState } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CAMPUS_LOCATIONS, CAMPUS_METADATA } from '../data/mockData';
import { useHustleContext } from '../context/HustleContext';
import { colors, shadows } from '../theme/colors';
import { isUnfilteredLocation } from '../utils/hustle';

export const LocationFilter: React.FC = () => {
  const { selectedLocation, setSelectedLocation, selectedCampus } = useHustleContext();
  const [isExpanded, setIsExpanded] = useState(false);

  const campusLocations = CAMPUS_LOCATIONS[selectedCampus] || CAMPUS_LOCATIONS.knust;
  const campusName = CAMPUS_METADATA[selectedCampus]?.shortName || 'KNUST';
  const defaultLabel = `All ${campusName}`;

  const isFiltered = !isUnfilteredLocation(selectedLocation);

  const handleSelectLocation = (loc: string) => {
    setSelectedLocation(loc);
    setIsExpanded(false);
  };

  const displayText = isFiltered
    ? selectedLocation
    : 'Filter by Hostel / Area';

  return (
    <View style={styles.container}>
      {/* Dropdown Toggle Button */}
      <TouchableOpacity
        style={[styles.dropdownBtn, isExpanded && styles.dropdownBtnExpanded]}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.8}
      >
        <View style={styles.btnLeft}>
          <Ionicons name="location-outline" size={17} color="#94A3B8" style={styles.pinIcon} />
          <Text style={[styles.btnText, isFiltered && styles.activeBtnText]} numberOfLines={1}>
            {displayText}
          </Text>
        </View>
        <Ionicons
          name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}
          size={18}
          color="#94A3B8"
        />
      </TouchableOpacity>

      {/* Expanded Location List matching screenshot */}
      {isExpanded && (
        <View style={styles.expandedMenu}>
          <ScrollView
            style={styles.scrollList}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
          >
            {campusLocations.map((loc, index) => {
              const isAllOption = isUnfilteredLocation(loc) || loc === defaultLabel || loc === 'All KNUST';
              const isSelected = isAllOption
                ? !isFiltered
                : selectedLocation === loc;

              return (
                <TouchableOpacity
                  key={loc}
                  style={[
                    styles.menuItem,
                    isSelected && isAllOption && styles.menuItemAllSelected,
                    isSelected && !isAllOption && styles.menuItemSelected,
                    index === campusLocations.length - 1 && styles.menuItemLast,
                  ]}
                  onPress={() => handleSelectLocation(isAllOption ? 'All Locations' : loc)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemLeft}>
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color={isSelected ? colors.primary : '#94A3B8'}
                      style={styles.itemPinIcon}
                    />
                    <Text
                      style={[
                        styles.menuItemText,
                        isSelected && styles.menuItemTextSelected,
                      ]}
                    >
                      {isAllOption ? defaultLabel : loc}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark" size={17} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  dropdownBtnExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderColor: '#CBD5E1',
  },
  btnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pinIcon: {
    marginRight: 10,
  },
  btnText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  activeBtnText: {
    color: '#0F172A',
    fontWeight: '700',
  },
  expandedMenu: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#CBD5E1',
    maxHeight: 260,
    overflow: 'hidden',
    ...shadows.card,
  },
  scrollList: {
    maxHeight: 260,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemAllSelected: {
    backgroundColor: '#F0FDF4', // light emerald tint
  },
  menuItemSelected: {
    backgroundColor: '#F8FAFC',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemPinIcon: {
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
  },
  menuItemTextSelected: {
    color: colors.primary, // #059669
    fontWeight: '700',
  },
});
