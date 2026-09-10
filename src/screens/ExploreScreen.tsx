import React, { useState, useMemo } from 'react';
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
} from 'react-native';
import { useHustleContext } from '../context/HustleContext';
import { HustleCard } from '../components/HustleCard';
import { PriceBracket, SortOption, DeliveryMode } from '../types';

interface ExploreScreenProps {
  navigation: any;
}

const TRENDING_SEARCHES = [
  { label: '📐 Calculus Tutoring', query: 'calculus' },
  { label: '📱 Screen Repair', query: 'screen' },
  { label: '💇 Knotless Braids', query: 'braids' },
  { label: '🎂 Birthday Cake', query: 'cake' },
  { label: '🧺 Laundry Runner', query: 'laundry' },
  { label: '📸 Graduation Shoot', query: 'photoshoot' },
  { label: '💻 Web / Graphics', query: 'design' },
];

const PRICE_BRACKETS: { id: PriceBracket; label: string }[] = [
  { id: 'all', label: 'Any Price' },
  { id: 'under_30', label: '< GH₵ 30' },
  { id: '30_70', label: 'GH₵ 30 - 70' },
  { id: '70_150', label: 'GH₵ 70 - 150' },
  { id: 'above_150', label: 'GH₵ 150+' },
];

const DELIVERY_OPTIONS: { id: DeliveryMode | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All Modes', icon: '✨' },
  { id: 'to_client', label: 'Hostel Delivery', icon: '🏠' },
  { id: 'at_seller', label: 'At Seller Room', icon: '📍' },
  { id: 'campus_spot', label: 'Campus Spot', icon: '🎓' },
  { id: 'remote', label: 'Remote / Online', icon: '💻' },
];

const KNUST_CLUSTERS = [
  'All Locations',
  'Ayeduase',
  'Kotei',
  'Brunei',
  'Traditional Halls',
  'Boadi',
  'Gaza',
  'Kentinkrono',
];

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'recommended', label: '⭐ Recommended' },
  { id: 'price_asc', label: '💵 Price: Low to High' },
  { id: 'price_desc', label: '💎 Price: High to Low' },
  { id: 'rating_desc', label: '★ Highest Rated' },
  { id: 'reviews_desc', label: '💬 Most Reviewed' },
];

export const ExploreScreen: React.FC<ExploreScreenProps> = ({ navigation }) => {
  const { hustles } = useHustleContext();

  const [search, setSearch] = useState('');
  const [selectedPriceBracket, setSelectedPriceBracket] = useState<PriceBracket>('all');
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryMode | 'all'>('all');
  const [selectedCluster, setSelectedCluster] = useState('All Locations');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Check how many filters are active
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedPriceBracket !== 'all') count++;
    if (selectedDelivery !== 'all') count++;
    if (selectedCluster !== 'All Locations') count++;
    if (sortBy !== 'recommended') count++;
    return count;
  }, [selectedPriceBracket, selectedDelivery, selectedCluster, sortBy]);

  const clearAllFilters = () => {
    setSearch('');
    setSelectedPriceBracket('all');
    setSelectedDelivery('all');
    setSelectedCluster('All Locations');
    setSortBy('recommended');
  };

  const filteredHustles = useMemo(() => {
    let results = [...hustles];

    // Search query filter
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      results = results.filter((h) => {
        return (
          h.title.toLowerCase().includes(q) ||
          h.description.toLowerCase().includes(q) ||
          h.sellerName.toLowerCase().includes(q) ||
          h.hostelLocation.toLowerCase().includes(q) ||
          h.tags.some((t) => t.toLowerCase().includes(q))
        );
      });
    }

    // Price bracket filter
    if (selectedPriceBracket !== 'all') {
      results = results.filter((h) => {
        if (selectedPriceBracket === 'under_30') return h.price < 30;
        if (selectedPriceBracket === '30_70') return h.price >= 30 && h.price <= 70;
        if (selectedPriceBracket === '70_150') return h.price > 70 && h.price <= 150;
        if (selectedPriceBracket === 'above_150') return h.price > 150;
        return true;
      });
    }

    // Delivery mode filter
    if (selectedDelivery !== 'all') {
      results = results.filter((h) => (h.deliveryMode || 'to_client') === selectedDelivery);
    }

    // Cluster filter
    if (selectedCluster !== 'All Locations') {
      results = results.filter((h) =>
        h.hostelLocation.toLowerCase().includes(selectedCluster.toLowerCase())
      );
    }

    // Sorting
    results.sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'rating_desc') return b.rating - a.rating;
      if (sortBy === 'reviews_desc') return b.reviewCount - a.reviewCount;
      // Default recommended (rating & date)
      return b.rating - a.rating || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return results;
  }, [hustles, search, selectedPriceBracket, selectedDelivery, selectedCluster, sortBy]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header Bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🧭 Explore Campus Hustles</Text>
        <Text style={styles.headerSubtitle}>
          Discover verified student side-hustlers across KNUST
        </Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Try 'braids', 'calculus', 'phone repair'..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
        {search !== '' && (
          <TouchableOpacity onPress={() => setSearch('')} style={styles.clearBtn}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Trending Suggestion Chips */}
      <View style={styles.suggestionsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsScroll}>
          {TRENDING_SEARCHES.map((item) => {
            const isSelected = search.toLowerCase() === item.query.toLowerCase();
            return (
              <TouchableOpacity
                key={item.query}
                style={[styles.trendingChip, isSelected && styles.trendingChipActive]}
                onPress={() => setSearch(isSelected ? '' : item.query)}
                activeOpacity={0.8}
              >
                <Text style={[styles.trendingText, isSelected && styles.trendingTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Filter Toolbar / Toggle Drawer Button */}
      <View style={styles.filterToolbar}>
        <TouchableOpacity
          style={[styles.filterToggleBtn, activeFiltersCount > 0 && styles.filterToggleBtnActive]}
          onPress={() => setFilterDrawerOpen(!filterDrawerOpen)}
          activeOpacity={0.8}
        >
          <Text style={styles.filterToggleIcon}>⚡</Text>
          <Text style={[styles.filterToggleText, activeFiltersCount > 0 && styles.filterToggleTextActive]}>
            Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}
          </Text>
          <Text style={styles.filterArrow}>{filterDrawerOpen ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {activeFiltersCount > 0 && (
          <TouchableOpacity style={styles.clearAllBtn} onPress={clearAllFilters}>
            <Text style={styles.clearAllText}>Reset All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Collapsible Rich Filter Panel */}
      {filterDrawerOpen && (
        <View style={styles.filterDrawer}>
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 280 }}>
            {/* Price Range */}
            <Text style={styles.filterSectionTitle}>💰 Budget Range</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsRow}>
              {PRICE_BRACKETS.map((bracket) => (
                <TouchableOpacity
                  key={bracket.id}
                  style={[styles.filterPill, selectedPriceBracket === bracket.id && styles.filterPillActive]}
                  onPress={() => setSelectedPriceBracket(bracket.id)}
                >
                  <Text style={[styles.filterPillText, selectedPriceBracket === bracket.id && styles.filterPillTextActive]}>
                    {bracket.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Delivery Mode */}
            <Text style={styles.filterSectionTitle}>🚚 Service / Delivery Mode</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsRow}>
              {DELIVERY_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.filterPill, selectedDelivery === opt.id && styles.filterPillActive]}
                  onPress={() => setSelectedDelivery(opt.id)}
                >
                  <Text style={[styles.filterPillText, selectedDelivery === opt.id && styles.filterPillTextActive]}>
                    {opt.icon} {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* KNUST Location Cluster */}
            <Text style={styles.filterSectionTitle}>📍 KNUST Zone / Hostel Area</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsRow}>
              {KNUST_CLUSTERS.map((cluster) => (
                <TouchableOpacity
                  key={cluster}
                  style={[styles.filterPill, selectedCluster === cluster && styles.filterPillActive]}
                  onPress={() => setSelectedCluster(cluster)}
                >
                  <Text style={[styles.filterPillText, selectedCluster === cluster && styles.filterPillTextActive]}>
                    {cluster}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Sort By */}
            <Text style={styles.filterSectionTitle}>📊 Sort Listings By</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsRow}>
              {SORT_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.filterPill, sortBy === opt.id && styles.filterPillActive]}
                  onPress={() => setSortBy(opt.id)}
                >
                  <Text style={[styles.filterPillText, sortBy === opt.id && styles.filterPillTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ScrollView>
        </View>
      )}

      {/* Results Header */}
      <View style={styles.resultsBar}>
        <Text style={styles.resultsCount}>
          {filteredHustles.length} {filteredHustles.length === 1 ? 'Hustle' : 'Hustles'} Available
        </Text>
        <Text style={styles.resultsSubtitle}>
          {selectedCluster !== 'All Locations' ? `in ${selectedCluster}` : 'Campus-wide'}
        </Text>
      </View>

      {/* Results List */}
      <FlatList
        data={filteredHustles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HustleCard
            hustle={item}
            onPress={() => navigation.navigate('HustleDetail', { hustleId: item.id })}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No matching student hustles</Text>
            <Text style={styles.emptySubtitle}>
              We couldn't find any listings with your current filter combination. Try adjusting price, location or search keywords.
            </Text>
            <TouchableOpacity style={styles.resetBtn} onPress={clearAllFilters}>
              <Text style={styles.resetBtnText}>🔄 Reset All Filters</Text>
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  clearBtn: {
    padding: 4,
  },
  clearText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '700',
  },
  suggestionsContainer: {
    marginTop: 4,
    marginBottom: 6,
  },
  suggestionsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  trendingChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  trendingChipActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  trendingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  trendingTextActive: {
    color: '#FFFFFF',
  },
  filterToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  filterToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  filterToggleBtnActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  filterToggleIcon: {
    fontSize: 13,
  },
  filterToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  filterToggleTextActive: {
    color: '#059669',
  },
  filterArrow: {
    fontSize: 10,
    color: '#64748B',
  },
  clearAllBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearAllText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '700',
  },
  filterDrawer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  pillsRow: {
    gap: 6,
    paddingBottom: 4,
  },
  filterPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  filterPillActive: {
    backgroundColor: '#059669',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  resultsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginTop: 6,
    marginBottom: 8,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  resultsSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyIcon: {
    fontSize: 42,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  resetBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
