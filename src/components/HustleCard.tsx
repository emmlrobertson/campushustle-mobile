import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Hustle } from '../types';
import { useHustleContext } from '../context/HustleContext';

interface HustleCardProps {
  hustle: Hustle;
  onPress: () => void;
}

export const HustleCard: React.FC<HustleCardProps> = ({ hustle, onPress }) => {
  const { isFavorite, toggleFavorite } = useHustleContext();
  const favorite = isFavorite(hustle.id);

  const status = hustle.status || 'OPEN';

  const categoryLabels: Record<string, { label: string; bg: string; text: string }> = {
    tutoring: { label: 'Tutoring', bg: '#DCFCE7', text: '#15803D' },
    tech_repair: { label: 'Tech Fix', bg: '#E0F2FE', text: '#0369A1' },
    photo_video: { label: 'Media', bg: '#FCE7F3', text: '#BE185D' },
    food_delivery: { label: 'Food', bg: '#FEF3C7', text: '#B45309' },
    fashion_beauty: { label: 'Beauty', bg: '#FEE2E2', text: '#B91C1C' },
    laundry_errands: { label: 'Clean', bg: '#F3E8FF', text: '#7E22CE' },
  };

  const catMeta = categoryLabels[hustle.category] || { label: hustle.category, bg: '#F1F5F9', text: '#475569' };

  const deliveryLabels: Record<string, { label: string; icon: string }> = {
    to_client: { label: 'At Your Hostel', icon: '🏠' },
    at_seller: { label: 'At My Hostel', icon: '📍' },
    campus_spot: { label: 'Campus Spot', icon: '🎓' },
    remote: { label: 'Remote', icon: '💻' },
  };

  const delivery = deliveryLabels[hustle.deliveryMode || 'to_client'] || deliveryLabels.to_client;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Image Banner Container */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: hustle.imageUrl }} style={styles.image} resizeMode="cover" />

        {/* Status Badge Overlaid Top Left */}
        <View style={styles.statusBadge}>
          <Text style={[styles.statusDot, status === 'OPEN' ? styles.openDot : styles.busyDot]}>●</Text>
          <Text style={styles.statusText}>{status === 'OPEN' ? 'AVAILABLE' : 'BUSY'}</Text>
        </View>

        {/* Top Rated / Featured Pill */}
        {hustle.isFeatured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>⭐ Top Rated</Text>
          </View>
        )}

        {/* Circular Heart Button Overlaid Top Right */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(hustle.id)}
          activeOpacity={0.8}
        >
          <Text style={styles.heartIcon}>{favorite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>

        {/* Price Tag Overlaid Bottom Left */}
        <View style={styles.priceOverlay}>
          <Text style={styles.priceText}>
            {hustle.priceType === 'starting_at' ? 'From ' : ''}GH₵ {hustle.price}
            {hustle.priceType === 'hourly' ? '/hr' : ''}
          </Text>
        </View>
      </View>

      {/* Card Content Body */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {hustle.title}
        </Text>

        {/* Location & Rating Row */}
        <View style={styles.metaRow}>
          <Text style={styles.locationText}>📍 {hustle.hostelLocation}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.ratingText}>{hustle.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({hustle.reviewCount})</Text>
          </View>
        </View>

        {/* Category & Delivery Mode Pills */}
        <View style={styles.footerRow}>
          <View style={styles.badgesCluster}>
            <View style={[styles.categoryBadge, { backgroundColor: catMeta.bg }]}>
              <Text style={[styles.categoryText, { color: catMeta.text }]}>{catMeta.label}</Text>
            </View>
            <View style={styles.deliveryBadge}>
              <Text style={styles.deliveryBadgeText}>{delivery.icon} {delivery.label}</Text>
            </View>
          </View>

          {/* Seller Avatar Pill */}
          <View style={styles.sellerPill}>
            <View style={styles.avatarMini}>
              <Text style={styles.avatarLetter}>{hustle.sellerName.charAt(0)}</Text>
            </View>
            <Text style={styles.sellerName} numberOfLines={1}>
              {hustle.sellerName}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  imageContainer: {
    height: 170,
    width: '100%',
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    fontSize: 8,
  },
  openDot: {
    color: '#10B981',
  },
  busyDot: {
    color: '#F59E0B',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    left: 76,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredText: {
    color: '#B45309',
    fontSize: 10,
    fontWeight: '800',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartIcon: {
    fontSize: 16,
  },
  priceOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#D97706', // Amber accent from Figma
  },
  content: {
    padding: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 22,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 11,
    marginRight: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D97706',
    marginRight: 2,
  },
  reviewCount: {
    fontSize: 11,
    color: '#94A3B8',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 10,
  },
  badgesCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    flex: 1,
    marginRight: 6,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
  },
  deliveryBadge: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  deliveryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  sellerPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarMini: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  sellerName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    maxWidth: 110,
  },
});
