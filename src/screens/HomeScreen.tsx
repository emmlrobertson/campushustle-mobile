import React from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Platform,
} from 'react-native';
import { useHustleContext } from '../context/HustleContext';
import { Header } from '../components/Header';
import { CategoryFilter } from '../components/CategoryFilter';
import { LocationFilter } from '../components/LocationFilter';
import { HustleCard } from '../components/HustleCard';
import { CAMPUS_METADATA } from '../data/mockData';
import { colors, shadows } from '../theme/colors';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const {
    filteredHustles,
    searchQuery,
    setSearchQuery,
    selectedLocation,
    selectedCategory,
    selectedCampus,
    isLoading,
    error,
    refreshHustles,
  } = useHustleContext();

  const campusInfo = CAMPUS_METADATA[selectedCampus] || CAMPUS_METADATA.knust;

  // Top Student Hustlers for the horizontal story/avatar bar (Figma)
  const topHustlers = [
    { id: '1', initials: 'AM', name: 'Abena', badge: 'Fast Delivery', bg: colors.badgeGreenBg, text: colors.badgeGreenText },
    { id: '2', initials: 'KA', name: 'Kwame', badge: 'New', bg: colors.badgePurpleBg, text: colors.badgePurpleText },
    { id: '3', initials: 'ET', name: 'Emmanuel', badge: 'Popular', bg: colors.badgeBlueBg, text: colors.badgeBlueText },
    { id: '4', initials: 'KO', name: 'Kofi', badge: 'Top Rated', bg: colors.badgeGoldBg, text: colors.badgeGoldText },
    { id: '5', initials: 'AS', name: 'Ama', badge: 'Beauty', bg: colors.badgePinkBg, text: colors.badgePinkText },
    { id: '6', initials: 'DB', name: 'Daniel', badge: 'Tutoring', bg: colors.badgeGreenBg, text: colors.badgeGreenText },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header />

      <FlatList
        data={filteredHustles}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => (
          <HustleCard
            hustle={item}
            isGrid={true}
            onPress={() => navigation.navigate('HustleDetail', { hustleId: item.id })}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshHustles}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.headerWrapper}>
            {/* Top Hustler Avatar Row (Figma) */}
            <View style={styles.avatarBarSection}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.avatarScroll}
              >
                {topHustlers.map((hustler) => (
                  <TouchableOpacity
                    key={hustler.id}
                    style={styles.hustlerPill}
                    activeOpacity={0.8}
                    onPress={() => setSearchQuery(hustler.name)}
                  >
                    <View style={styles.hustlerAvatar}>
                      <Text style={styles.hustlerInitials}>{hustler.initials}</Text>
                    </View>
                    <View style={styles.hustlerInfo}>
                      <Text style={styles.hustlerName}>{hustler.name}</Text>
                      <View style={[styles.hustlerBadge, { backgroundColor: hustler.bg }]}>
                        <Text style={[styles.hustlerBadgeText, { color: hustler.text }]}>
                          {hustler.badge}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Search Bar matching Figma */}
            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search tutoring, food, repairs..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery !== '' && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.clearText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Category Filter Horizontal Pills with 'Other' custom input */}
            <CategoryFilter />

            {/* Hostel Dropdown Filter */}
            <LocationFilter />

            {/* Results Count & Live Status Bar */}
            <View style={styles.resultsBar}>
              <Text style={styles.resultsCount}>
                {filteredHustles.length} Services available
              </Text>
              <View style={styles.liveBadge}>
                <Text style={styles.liveDot}>●</Text>
                <Text style={styles.liveText}>Live</Text>
              </View>
            </View>
          </View>
        }
        ListFooterComponent={
          /* Deep Forest Green Callout Banner from Figma */
          <View style={styles.ctaBanner}>
            <View style={styles.ctaTextContainer}>
              <Text style={styles.ctaTitle}>Have a skill? Start earning</Text>
              <Text style={styles.ctaSubtitle}>
                Post your service and connect with students
              </Text>
            </View>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => navigation.navigate('Post')}
              activeOpacity={0.88}
            >
              <Text style={styles.ctaButtonText}>Post →</Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>No matching services found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search query, selecting "All", or choosing a different campus hostel location.
              </Text>
              {(searchQuery !== '' || selectedLocation !== 'All Locations' || selectedCategory !== 'all') && (
                <TouchableOpacity
                  style={styles.resetBtn}
                  onPress={() => {
                    setSearchQuery('');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.resetBtnText}>Reset All Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingBottom: 28,
  },
  headerWrapper: {
    marginBottom: 8,
  },
  // Top Hustler Avatar Row
  avatarBarSection: {
    marginVertical: 10,
  },
  avatarScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  hustlerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  hustlerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryMint,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  hustlerInitials: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  hustlerInfo: {
    justifyContent: 'center',
  },
  hustlerName: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  hustlerBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  hustlerBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  // Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 14,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 11 : 9,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 4,
    marginBottom: 6,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: colors.textPrimary,
    fontWeight: '600',
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  clearText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '700',
  },
  // Results bar
  resultsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginTop: 6,
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryMint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  liveDot: {
    color: colors.primary,
    fontSize: 8,
    marginRight: 4,
  },
  liveText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  // Deep Forest Green CTA Banner
  ctaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary, // #0D6535
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 18,
    padding: 18,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  ctaTitle: {
    color: colors.textWhite,
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  ctaSubtitle: {
    color: colors.primaryMint,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  ctaButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  ctaButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  resetBtn: {
    marginTop: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
  },
  resetBtnText: {
    color: colors.textWhite,
    fontSize: 13,
    fontWeight: '800',
  },
});
