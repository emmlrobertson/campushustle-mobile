import React from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHustleContext } from '../context/HustleContext';
import { HustleCard } from '../components/HustleCard';
import { CAMPUS_METADATA } from '../data/mockData';
import { colors, shadows } from '../theme/colors';

interface FavoritesScreenProps {
  navigation: any;
}

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({ navigation }) => {
  const { hustles, favorites, savedHustles, selectedCampus } = useHustleContext();
  const campusInfo = CAMPUS_METADATA[selectedCampus] || CAMPUS_METADATA.knust;

  const favoriteHustles = savedHustles.length
    ? savedHustles.filter((h) => favorites.includes(h.id))
    : hustles.filter((h) => favorites.includes(h.id));

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Saved Hustles</Text>
          <Text style={styles.headerSubtitle}>
            {favoriteHustles.length} {favoriteHustles.length === 1 ? 'service' : 'services'} bookmarked
          </Text>
        </View>
        <View style={styles.campusPill}>
          <Ionicons name="location-sharp" size={12} color="#FFFFFF" style={{ marginRight: 3 }} />
          <Text style={styles.campusPillText}>{campusInfo.shortName}</Text>
        </View>
      </View>

      <FlatList
        data={favoriteHustles}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => (
          <HustleCard
            hustle={item}
            onPress={() => navigation.navigate('HustleDetail', { hustleId: item.id })}
            isGrid={true}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="bookmark-outline" size={32} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No saved hustles yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the heart icon on any hustle card to save it for quick access when you need it.
            </Text>
            <TouchableOpacity
              style={styles.browseBtn}
              onPress={() => navigation.navigate('Home')}
              activeOpacity={0.85}
            >
              <Text style={styles.browseBtnText}>Explore {campusInfo.shortName} Market</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.card,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  campusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  campusPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  listContent: {
    paddingTop: 14,
    paddingBottom: 32,
  },
  columnWrapper: {
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 36,
    marginTop: 40,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  browseBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    ...shadows.card,
  },
  browseBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
