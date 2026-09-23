import React, { useState } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { CAMPUS_LOCATIONS, CAMPUS_METADATA } from '../data/mockData';
import { useHustleContext } from '../context/HustleContext';
import { colors, shadows } from '../theme/colors';

export const LocationFilter: React.FC = () => {
  const { selectedLocation, setSelectedLocation, selectedCampus } = useHustleContext();
  const [modalVisible, setModalVisible] = useState(false);

  const isFiltered = selectedLocation !== 'All Locations';
  const campusLocations = CAMPUS_LOCATIONS[selectedCampus] || CAMPUS_LOCATIONS.knust;
  const campusName = CAMPUS_METADATA[selectedCampus]?.shortName || 'Campus';

  return (
    <View style={styles.container}>
      <View style={styles.dropdownBtnRow}>
        <TouchableOpacity
          style={[styles.dropdownBtn, isFiltered && styles.activeDropdownBtn]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.pinIcon}>📍</Text>
          <Text style={[styles.btnText, isFiltered && styles.activeBtnText]} numberOfLines={1}>
            {isFiltered ? selectedLocation : `Filter by Hostel / Area`}
          </Text>
          <Text style={styles.arrowIcon}>˅</Text>
        </TouchableOpacity>

        {isFiltered && (
          <TouchableOpacity
            style={styles.clearChip}
            onPress={() => setSelectedLocation('All Locations')}
            activeOpacity={0.7}
          >
            <Text style={styles.clearChipText}>✕ Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Dropdown Modal Menu */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.dropdownMenu}>
                <View style={styles.menuHeader}>
                  <Text style={styles.menuTitle}>📍 Select {campusName} Hostel / Area</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={styles.closeBtn}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.menuList} showsVerticalScrollIndicator={false}>
                  {campusLocations.map((loc) => {
                    const isSelected = selectedLocation === loc;
                    return (
                      <TouchableOpacity
                        key={loc}
                        style={[styles.menuItem, isSelected && styles.selectedMenuItem]}
                        onPress={() => {
                          setSelectedLocation(loc);
                          setModalVisible(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.menuItemText, isSelected && styles.selectedMenuItemText]}>
                          {loc === 'All Locations' ? `📍 All ${campusName} Locations` : `📍 ${loc}`}
                        </Text>
                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  dropdownBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeDropdownBtn: {
    backgroundColor: colors.primaryMint,
    borderColor: colors.primary,
  },
  pinIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  btnText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  activeBtnText: {
    color: colors.primary,
  },
  arrowIcon: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 4,
    fontWeight: '800',
  },
  clearChip: {
    backgroundColor: colors.busyBg,
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 12,
  },
  clearChipText: {
    color: colors.busyText,
    fontSize: 11.5,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dropdownMenu: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    width: '100%',
    maxWidth: 380,
    maxHeight: 400,
    padding: 18,
    ...shadows.cardHover,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    marginBottom: 8,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  closeBtn: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '700',
    padding: 4,
  },
  menuList: {
    maxHeight: 310,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  selectedMenuItem: {
    backgroundColor: colors.primaryMint,
  },
  menuItemText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  selectedMenuItemText: {
    color: colors.primary,
    fontWeight: '800',
  },
  checkmark: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '900',
  },
});
