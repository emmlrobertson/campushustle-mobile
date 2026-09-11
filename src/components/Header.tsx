import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { useHustleContext } from '../context/HustleContext';
import { CampusId } from '../types';

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
        <View>
          <Text style={styles.logoText}>
            Campus<Text style={styles.greenText}>Hustle</Text>
          </Text>
          <Text style={styles.subtext}>Student Side-Hustles · {campusBadges[selectedCampus]}</Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => setBellModalVisible(true)}
            activeOpacity={0.8}
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
            <Text style={styles.downArrow}>▼</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Campus Selector Modal */}
      <Modal visible={campusModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Your Campus</Text>
              <TouchableOpacity onPress={() => setCampusModalVisible(false)}>
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
              <Text style={styles.modalTitle}>🔔 Campus Alerts</Text>
              <TouchableOpacity onPress={() => setBellModalVisible(false)}>
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  greenText: {
    color: '#059669', // Emerald Green
  },
  subtext: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bellBtn: {
    backgroundColor: '#FEF3C7',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bellIcon: {
    fontSize: 15,
  },
  bellDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  campusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    gap: 4,
  },
  pinIcon: {
    fontSize: 11,
  },
  campusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  downArrow: {
    color: '#D1FAE5',
    fontSize: 9,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 420,
    padding: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '700',
    padding: 4,
  },
  campusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  campusItemActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
  },
  campusItemIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  campusItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  campusItemNameActive: {
    color: '#059669',
  },
  campusItemDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  checkIcon: {
    color: '#059669',
    fontSize: 16,
    fontWeight: '900',
  },
  alertCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  alertCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  alertCardBody: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },
  ackBtn: {
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  ackBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
