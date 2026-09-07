import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useHustleContext } from '../context/HustleContext';

export const Header: React.FC = () => {
  const { selectedCampus } = useHustleContext();

  const campusBadges = {
    knust: 'KNUST',
    ug_legon: 'UG Legon',
    ucc: 'UCC',
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
          <TouchableOpacity style={styles.bellBtn} activeOpacity={0.8}>
            <Text style={styles.bellIcon}>🔔</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.campusPill} activeOpacity={0.85}>
            <Text style={styles.pinIcon}>📍</Text>
            <Text style={styles.campusText}>{campusBadges[selectedCampus]}</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    color: '#059669', // Emerald Green from Figma
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
  },
  bellIcon: {
    fontSize: 15,
  },
  campusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669', // Emerald Green
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  pinIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  campusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
