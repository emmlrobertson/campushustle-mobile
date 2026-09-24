import React from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Image,
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
import { isUnfilteredLocation } from '../utils/hustle';

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
    setSelectedLocation,
    setSelectedCategory,
    isLoading,
    error,
    refreshHustles,
    isFavorite,
    toggleFavorite,
  } = useHustleContext();

  // Extract the featured hustle (first featured one or first item)
  const featuredHustle = filteredHustles.find((h) => h.isFeatured) || filteredHustles[0];
  const moreHustles = featuredHustle
    ? filteredHustles.filter((h) => h.id !== featuredHustle.id)
    : filteredHustles;

  const isHeroFav = featuredHustle ? isFavorite(featuredHustle.id) : false;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header />

      <FlatList
        data={moreHustles}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={moreHustles.length > 0 ? styles.columnWrapper : undefined}
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
            {/* Search Bar matching screenshots */}
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={19} color="#94A3B8" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search tutoring, food, repairs..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery !== '' && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            {/* Category Filter Horizontal Pills with Vector Icons */}
            <CategoryFilter />

            {/* Hostel Dropdown Filter */}
            <LocationFilter />

            {/* Results Count & Live Status Bar */}
            <View style={styles.resultsBar}>
              <Text style={styles.resultsCount}>
                {filteredHustles.length} Services available
              </Text>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Live</Text>
              </View>
            </View>

            {/* Prominent Featured Service Card matching screenshot */}
            {featuredHustle && (
              <TouchableOpacity
                style={styles.featuredCard}
                activeOpacity={0.92}
                onPress={() => navigation.navigate('HustleDetail', { hustleId: featuredHustle.id })}
              >
                <Image
                  source={{
                    uri: getHustleImageUrl(
                      featuredHustle.imageUrl,
                      featuredHustle.category,
                      featuredHustle.title
                    ),
                  }}
                  style={styles.featuredImage}
                  resizeMode="cover"
                />
                <View style={styles.featuredOverlay} />

                {/* Top Badges Row */}
                <View style={styles.featuredTopRow}>
                  <View style={styles.featuredBadgeCluster}>
                    <View style={styles.featuredPill}>
                      <Text style={styles.featuredPillText}>Featured</Text>
                    </View>
                    <View style={styles.topRatedPill}>
                      <Text style={styles.topRatedPillText}>Top Rated</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.featuredHeartBtn}
                    onPress={(e) => {
                      e?.stopPropagation?.();
                      toggleFavorite(featuredHustle.id);
                    }}
                    activeOpacity={0.8}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name={isHeroFav ? 'heart' : 'heart-outline'}
                      size={18}
                      color={isHeroFav ? '#EF4444' : '#64748B'}
                    />
                  </TouchableOpacity>
                </View>

                {/* Bottom Content Info */}
                <View style={styles.featuredBottomInfo}>
                  <View style={styles.featuredLocationRow}>
                    <Ionicons name="location-sharp" size={13} color="#10B981" style={{ marginRight: 4 }} />
                    <Text style={styles.featuredLocationText}>{featuredHustle.hostelLocation}</Text>
                  </View>

                  <Text style={styles.featuredTitle} numberOfLines={2}>
                    {featuredHustle.title}
                  </Text>

                  <Text style={styles.featuredSeller}>
                    {featuredHustle.sellerName} · {featuredHustle.sellerProgram}
                  </Text>

                  <View style={styles.featuredFooterRow}>
                    <View style={styles.featuredReviewsRow}>
                      <Ionicons name="star" size={14} color="#F59E0B" style={{ marginRight: 4 }} />
                      <Text style={styles.featuredReviewsText}>
                        ({featuredHustle.reviewCount || 0} reviews)
                      </Text>
                    </View>

                    <View style={styles.featuredPriceBox}>
                      <Text style={styles.featuredPriceAmount}>
                        GH₵ {featuredHustle.price}
                      </Text>
                      <Text style={styles.featuredPriceSuffix}>
                        {featuredHustle.priceType === 'hourly' ? 'per hour' : 'flat fee'}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {/* "MORE SERVICES" Header */}
            {moreHustles.length > 0 && (
              <View style={styles.moreServicesHeader}>
                <Text style={styles.moreServicesText}>MORE SERVICES</Text>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          !isLoading && filteredHustles.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name={error ? 'cloud-offline-outline' : 'search-outline'}
                size={40}
                color="#94A3B8"
                style={{ marginBottom: 12 }}
              />
              <Text style={styles.emptyTitle}>
                {error ? 'Unable to load services' : 'No matching services found'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {error
                  ? error
                  : 'Try adjusting your search query, selecting "All", or choosing a different campus hostel location.'}
              </Text>
              {error ? (
                <TouchableOpacity
                  style={styles.resetBtn}
                  onPress={refreshHustles}
                  activeOpacity={0.8}
                >
                  <Text style={styles.resetBtnText}>Retry</Text>
                </TouchableOpacity>
              ) : (
                (searchQuery !== '' ||
                  !isUnfilteredLocation(selectedLocation) ||
                  selectedCategory !== 'all') && (
                  <TouchableOpacity
                    style={styles.resetBtn}
                    onPress={() => {
                      setSearchQuery('');
                      setSelectedLocation('All Locations');
                      setSelectedCategory('all');
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.resetBtnText}>Reset All Filters</Text>
                  </TouchableOpacity>
                )
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
    backgroundColor: '#F8FAFC',
  },
  listContent: {
    paddingBottom: 28,
  },
  headerWrapper: {
    marginBottom: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
    padding: 0,
  },
  clearButton: {
    padding: 2,
  },
  resultsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  liveText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  featuredCard: {
    marginHorizontal: 16,
    height: 240,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 18,
    backgroundColor: '#0F172A',
    ...shadows.card,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  featuredTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  featuredBadgeCluster: {
    flexDirection: 'row',
    gap: 8,
  },
  featuredPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 8,
  },
  featuredPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  topRatedPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 8,
  },
  topRatedPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
  },
  featuredHeartBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  featuredBottomInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  featuredLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  featuredLocationText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 22,
    marginBottom: 4,
  },
  featuredSeller: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 8,
  },
  featuredFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  featuredReviewsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredReviewsText: {
    fontSize: 12,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  featuredPriceBox: {
    alignItems: 'flex-end',
  },
  featuredPriceAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  featuredPriceSuffix: {
    fontSize: 10.5,
    color: '#E2E8F0',
    fontWeight: '600',
    marginTop: -2,
  },
  moreServicesHeader: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  moreServicesText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  columnWrapper: {
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  resetBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
