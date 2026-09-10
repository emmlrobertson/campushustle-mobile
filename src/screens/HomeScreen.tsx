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
} from 'react-native';
import { useHustleContext } from '../context/HustleContext';
import { Header } from '../components/Header';
import { CategoryFilter } from '../components/CategoryFilter';
import { LocationFilter } from '../components/LocationFilter';
import { HustleCard } from '../components/HustleCard';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { filteredHustles, searchQuery, setSearchQuery, selectedLocation, selectedCategory } =
    useHustleContext();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header />

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
        ListHeaderComponent={
          <View style={styles.headerWrapper}>
            {/* Search Bar */}
            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search tutoring, repairs, food, braids..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery !== '' && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                  <Text style={styles.clearText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Trending Search Suggestion Chips */}
            <View style={styles.suggestionSection}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.suggestionsScroll}
              >
                {[
                  { label: '📐 Calculus Tutoring', query: 'calculus' },
                  { label: '📱 Screen Repair', query: 'screen' },
                  { label: '💇 Knotless Braids', query: 'braids' },
                  { label: '🎂 Birthday Cake', query: 'cake' },
                  { label: '🧺 Laundry Runner', query: 'laundry' },
                  { label: '📸 Photo Shoot', query: 'photo' },
                  { label: '💻 Web / Graphics', query: 'design' },
                ].map((item) => {
                  const isSelected = searchQuery.toLowerCase() === item.query.toLowerCase();
                  return (
                    <TouchableOpacity
                      key={item.query}
                      style={[styles.suggestionChip, isSelected && styles.suggestionChipActive]}
                      onPress={() => setSearchQuery(isSelected ? '' : item.query)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.suggestionChipText,
                          isSelected && styles.suggestionChipTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Category Filter Horizontal Pills */}
            <CategoryFilter />

            {/* Hostel Dropdown Filter */}
            <LocationFilter />

            {/* Results Count Bar */}
            <View style={styles.resultsBar}>
              <Text style={styles.resultsCount}>
                {filteredHustles.length} Hustles Found
              </Text>
              <View style={styles.liveBadge}>
                <Text style={styles.liveDot}>●</Text>
                <Text style={styles.liveText}>Live</Text>
              </View>
            </View>
          </View>
        }
        ListFooterComponent={
          /* Got a skill? Post it! Callout Banner from Figma */
          <View style={styles.ctaBanner}>
            <View style={styles.ctaTextContainer}>
              <Text style={styles.ctaTitle}>Got a skill? Post it!</Text>
              <Text style={styles.ctaSubtitle}>Earn from your classmates today</Text>
            </View>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => navigation.navigate('Post')}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaButtonText}>+ Post Hustle</Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {searchQuery !== '' || selectedCategory !== 'all' || selectedLocation !== 'All Locations' ? (
              <>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyTitle}>No hustles match your search</Text>
                <Text style={styles.emptySubtitle}>
                  Try clearing filters or searching for different keywords.
                </Text>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={() => setSearchQuery('')}
                >
                  <Text style={styles.resetButtonText}>Clear Search</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.emptyIcon}>🎓🔥</Text>
                <Text style={styles.emptyTitle}>Welcome to CampusHustle KNUST!</Text>
                <Text style={styles.emptySubtitle}>
                  Be the pioneer student to publish a side-hustle & earn from your classmates today!
                </Text>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={() => navigation.navigate('Post')}
                >
                  <Text style={styles.resetButtonText}>🚀 Post the First Hustle</Text>
                </TouchableOpacity>
              </>
            )}
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
  headerWrapper: {
    paddingTop: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 4,
    paddingHorizontal: 14,
    height: 46,
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
  clearButton: {
    padding: 4,
  },
  clearText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '700',
  },
  suggestionSection: {
    marginVertical: 6,
  },
  suggestionsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  suggestionChipActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  suggestionChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  suggestionChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  resultsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 4,
  },
  resultsCount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveDot: {
    fontSize: 8,
    color: '#10B981',
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  ctaBanner: {
    backgroundColor: '#059669', // Emerald Green from Figma
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  ctaSubtitle: {
    fontSize: 12,
    color: '#D1FAE5',
    fontWeight: '500',
  },
  ctaButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  ctaButtonText: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  resetButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
