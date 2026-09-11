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
            {isFiltered ? selectedLocation : `Filter by ${campusName} Hostel / Area`}
          </Text>
          <Text style={styles.arrowIcon}>▼</Text>
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
                  <Text style={styles.menuTitle}>Select {campusName} Hostel / Area</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
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
    marginBottom: 10,
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
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeDropdownBtn: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
  },
  pinIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  btnText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  activeBtnText: {
    color: '#059669',
  },
  arrowIcon: {
    fontSize: 10,
    color: '#64748B',
    marginLeft: 4,
  },
  clearChip: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
  },
  clearChipText: {
    color: '#D97706',
    fontSize: 12,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxHeight: 380,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 8,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '700',
    padding: 4,
  },
  menuList: {
    maxHeight: 300,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  selectedMenuItem: {
    backgroundColor: '#ECFDF5',
  },
  menuItemText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
  },
  selectedMenuItemText: {
    color: '#059669',
    fontWeight: '800',
  },
  checkmark: {
    color: '#059669',
    fontSize: 16,
    fontWeight: '900',
  },
});
