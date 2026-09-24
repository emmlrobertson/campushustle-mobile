import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHustleContext } from '../context/HustleContext';
import { Header } from '../components/Header';
import { CategoryFilter } from '../components/CategoryFilter';
import { LocationFilter } from '../components/LocationFilter';
import { HustleCard } from '../components/HustleCard';
import { Hustle } from '../types';
import { getHustleImageUrl } from '../utils/imageHelper';
import { colors, shadows } from '../theme/colors';
import { formatRating } from '../utils/hustle';

interface ExploreScreenProps {
  navigation: any;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({ navigation }) => {
  const {
    filteredHustles,
    searchQuery,
    setSearchQuery,
    isFavorite,
    toggleFavorite,
    error,
    isLoading,
    refreshHustles,
  } = useHustleContext();

  // Find a prominent featured hustle for the hero card banner (Figma)
  const heroHustle = useMemo(() => {
    return filteredHustles.find((h) => h.isFeatured) || filteredHustles[0] || null;
  }, [filteredHustles]);

  // Remaining hustles to display in the 2-column "MORE SERVICES" grid
  const gridHustles = useMemo(() => {
    if (!heroHustle) return filteredHustles;
    return filteredHustles.filter((h) => h.id !== heroHustle.id);
  }, [filteredHustles, heroHustle]);

  const isHeroFavorite = heroHustle ? isFavorite(heroHustle.id) : false;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header />

      <FlatList
        data={gridHustles}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={gridHustles.length > 0 ? styles.columnWrapper : undefined}
        renderItem={({ item }) => (
          <HustleCard
            hustle={item}
            isGrid={true}
            onPress={() => navigation.navigate('HustleDetail', { hustleId: item.id })}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerWrapper}>
            {/* Search Input */}
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search tutoring, food, repairs..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery !== '' && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close-circle" size={17} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            {/* Category Filter Pills Carousel with 'Other' slide-in */}
            <CategoryFilter />

            {/* Hostel Dropdown Filter */}
            <LocationFilter />

            {/* Live Counter Row */}
            <View style={styles.counterRow}>
              <Text style={styles.counterText}>
                {filteredHustles.length} Services available
              </Text>
              <View style={styles.liveBadge}>
                <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.primary, marginRight: 5 }} />
                <Text style={styles.liveText}>Live</Text>
              </View>
            </View>

            {/* Featured Hero Banner Card */}
            {heroHustle && (
              <TouchableOpacity
                style={styles.heroCard}
                onPress={() => navigation.navigate('HustleDetail', { hustleId: heroHustle.id })}
                activeOpacity={0.92}
              >
                <Image
                  source={{ uri: getHustleImageUrl(heroHustle.imageUrl, heroHustle.category, heroHustle.title) }}
                  style={styles.heroImage}
                  resizeMode="cover"
                />
                <View style={styles.heroGradientOverlay} />

                {/* Badges Top Left & Heart Top Right */}
                <View style={styles.heroTopRow}>
                  <View style={styles.heroBadgesCluster}>
                    <View style={styles.badgeGold}>
                      <Text style={styles.badgeGoldText}>Featured</Text>
                    </View>
                    <View style={styles.badgeOrange}>
                      <Text style={styles.badgeOrangeText}>Top Rated</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.heroFavoriteBtn}
                    onPress={(e) => {
                      e?.stopPropagation?.();
                      toggleFavorite(heroHustle.id);
                    }}
                    activeOpacity={0.8}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name={isHeroFavorite ? 'heart' : 'heart-outline'}
                      size={18}
                      color={isHeroFavorite ? '#EF4444' : '#64748B'}
                    />
                  </TouchableOpacity>
                </View>

                {/* Hero Details Bottom Section */}
                <View style={styles.heroBottomContent}>
                  <View style={styles.locationPill}>
                    <Ionicons name="location-sharp" size={12} color="#10B981" style={{ marginRight: 4 }} />
                    <Text style={styles.locationPillText}>{heroHustle.hostelLocation}</Text>
                  </View>

                  <Text style={styles.heroTitle} numberOfLines={2}>
                    {heroHustle.title}
                  </Text>

                  <Text style={styles.heroSubtitle} numberOfLines={1}>
                    {heroHustle.sellerName} · Verified Student Hustler
                  </Text>

                  <View style={styles.heroFooterRow}>
                    <View style={styles.heroRatingRow}>
                      <Ionicons name="star" size={13} color="#F59E0B" style={{ marginRight: 3 }} />
                      <Text style={styles.heroRatingText}>
                        {formatRating(heroHustle.rating)} ({heroHustle.reviewCount || 0} reviews)
                      </Text>
                    </View>

                    <View style={styles.heroPriceBadge}>
                      <Text style={styles.heroPriceText}>
                        GH₵ {heroHustle.price} {heroHustle.priceType === 'hourly' ? 'per hour' : 'flat fee'}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {/* MORE SERVICES Section Title */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderTitle}>MORE SERVICES</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          filteredHustles.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name={error ? 'cloud-offline-outline' : 'search-outline'}
              size={36}
              color="#94A3B8"
              style={{ marginBottom: 10 }}
            />
            <Text style={styles.emptyTitle}>{error ? 'Unable to load services' : 'No services found'}</Text>
            <Text style={styles.emptySubtitle}>
              {error
                ? error
                : 'Try searching with another keyword or picking a different hostel area.'}
            </Text>
            {error ? (
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={refreshHustles}
                activeOpacity={0.85}
              >
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            ) : null}
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
    marginTop: 6,
    marginBottom: 4,
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
  clearBtn: {
    padding: 4,
  },
  clearBtnText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '700',
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginTop: 4,
    marginBottom: 12,
  },
  counterText: {
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
  // Featured Hero Card (Figma)
  heroCard: {
    position: 'relative',
    marginHorizontal: 16,
    height: 220,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 16,
    ...shadows.cardHover,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  heroTopRow: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroBadgesCluster: {
    flexDirection: 'row',
    gap: 6,
  },
  badgeGold: {
    backgroundColor: colors.badgeGoldBg,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeGoldText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.badgeGoldText,
  },
  badgeOrange: {
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeOrangeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#C2410C',
  },
  heroFavoriteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroFavoriteIcon: {
    fontSize: 15,
  },
  heroBottomContent: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
  },
  locationPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(13, 101, 53, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
  },
  locationPillText: {
    color: colors.textWhite,
    fontSize: 10.5,
    fontWeight: '800',
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.textWhite,
    marginBottom: 4,
    lineHeight: 22,
  },
  heroSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 10,
  },
  heroFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroStar: {
    color: colors.ratingStar,
    fontSize: 14,
    marginRight: 4,
  },
  heroRatingText: {
    color: colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
  },
  heroPriceBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroPriceText: {
    color: colors.textWhite,
    fontSize: 12,
    fontWeight: '900',
  },
  sectionHeaderRow: {
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  sectionHeaderTitle: {
    fontSize: 11.5,
    fontWeight: '900',
    color: colors.textSecondary,
    letterSpacing: 0.8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 10,
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
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
