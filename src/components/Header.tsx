import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { useHustleContext } from '../context/HustleContext';
import { CampusId } from '../types';
import { colors, shadows } from '../theme/colors';

export const Header: React.FC = () => {
  const { selectedCampus, setSelectedCampus } = useHustleContext();
  const [campusModalVisible, setCampusModalVisible] = useState(false);
  const [bellModalVisible, setBellModalVisible] = useState(false);

  const campusBadges: Record<CampusId, string> = {
    knust: 'KNUST',
    ug_legon: 'UG Legon',
    ucc: 'UCC',
  };

  const meetupHubs: Record<CampusId, string> = {
    knust: 'Recommended safe meeting locations at KNUST: CCB Ground Floor, Main Library Forecourt, and Brunei Market.',
    ug_legon: 'Recommended safe meeting locations at UG Legon: Balme Library Forecourt, Night Market Hub, and Central Cafeteria.',
    ucc: 'Recommended safe meeting locations at UCC: Sam Jonah Library, Science Quadrangle, and Casford Field.',
  };

  const campuses: { id: CampusId; name: string; city: string; icon: string }[] = [
    { id: 'knust', name: 'Kwame Nkrumah Univ. of Science & Tech', city: 'Kumasi', icon: '🏛️' },
    { id: 'ug_legon', name: 'University of Ghana (Legon)', city: 'Accra', icon: '🎓' },
    { id: 'ucc', name: 'University of Cape Coast', city: 'Cape Coast', icon: '🌊' },
  ];

  const handleSelectCampus = (campusId: CampusId) => {
    setSelectedCampus(campusId);
    setCampusModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>
        <View style={styles.titleArea}>
          <Text style={styles.logoText}>
            Campus<Text style={styles.greenText}>Hustle</Text>
          </Text>
          <Text style={styles.subtext}>{campusBadges[selectedCampus]} · Student Marketplace</Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => setBellModalVisible(true)}
            activeOpacity={0.75}
            accessibilityLabel="Notifications"
          >
            <Text style={styles.bellIcon}>🔔</Text>
            <View style={styles.bellDot} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.campusPill}
            onPress={() => setCampusModalVisible(true)}
            activeOpacity={0.85}
            accessibilityLabel="Switch Campus"
          >
            <Text style={styles.pinIcon}>📍</Text>
            <Text style={styles.campusText}>{campusBadges[selectedCampus]}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Campus Selector Modal */}
      <Modal visible={campusModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Your Campus</Text>
              <TouchableOpacity onPress={() => setCampusModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {campuses.map((c) => {
                const isSelected = selectedCampus === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.campusItem, isSelected && styles.campusItemActive]}
                    onPress={() => handleSelectCampus(c.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.campusItemIcon}>{c.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.campusItemName, isSelected && styles.campusItemNameActive]}>
                        {campusBadges[c.id]}
                      </Text>
                      <Text style={styles.campusItemDesc}>{c.name} · {c.city}</Text>
                    </View>
                    {isSelected && <Text style={styles.checkIcon}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal visible={bellModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🔔 Campus Alerts & Safety</Text>
              <TouchableOpacity onPress={() => setBellModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.alertCard}>
              <Text style={styles.alertCardTitle}>🛡️ Campus Escrow Protection Active</Text>
              <Text style={styles.alertCardBody}>
                All MoMo payments are held securely in Escrow until you meet the student seller on campus and verify service delivery!
              </Text>
            </View>

            <View style={styles.alertCard}>
              <Text style={styles.alertCardTitle}>📍 Safe Campus Meetup Hubs</Text>
              <Text style={styles.alertCardBody}>
                {meetupHubs[selectedCampus]}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.ackBtn}
              onPress={() => setBellModalVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.ackBtnText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 8 : 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleArea: {
    flex: 1,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  greenText: {
    color: colors.primary, // Deep Forest Green (#0D6535)
  },
  subtext: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bellBtn: {
    backgroundColor: colors.surfaceAlt,
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.border,
  },
  bellIcon: {
    fontSize: 16,
  },
  bellDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  campusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  pinIcon: {
    fontSize: 12,
    marginRight: 2,
  },
  campusText: {
    color: colors.textWhite,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    padding: 20,
    ...shadows.cardHover,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  closeBtn: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '700',
    padding: 4,
  },
  campusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  campusItemActive: {
    backgroundColor: colors.primaryMint,
    borderColor: colors.primary,
  },
  campusItemIcon: {
    fontSize: 22,
    marginRight: 14,
  },
  campusItemName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  campusItemNameActive: {
    color: colors.primary,
  },
  campusItemDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  checkIcon: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '900',
    marginLeft: 8,
  },
  alertCard: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  alertCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  alertCardBody: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  ackBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 6,
  },
  ackBtnText: {
    color: colors.textWhite,
    fontSize: 14,
    fontWeight: '800',
  },
});
