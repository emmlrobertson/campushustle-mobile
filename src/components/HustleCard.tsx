import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Hustle } from '../types';
import { useHustleContext } from '../context/HustleContext';
import { getHustleImageUrl } from '../utils/imageHelper';
import { colors, shadows } from '../theme/colors';

interface HustleCardProps {
  hustle: Hustle;
  onPress: () => void;
  isGrid?: boolean;
}

export const HustleCard: React.FC<HustleCardProps> = ({ hustle, onPress, isGrid = true }) => {
  const { isFavorite, toggleFavorite } = useHustleContext();
  const favorite = isFavorite(hustle.id);

  const [imageUri, setImageUri] = useState<string>(() =>
    getHustleImageUrl(hustle.imageUrl, hustle.category, hustle.title)
  );

  useEffect(() => {
    setImageUri(getHustleImageUrl(hustle.imageUrl, hustle.category, hustle.title));
  }, [hustle.imageUrl, hustle.category, hustle.title]);

  const isAvailable = hustle.status !== 'BUSY';

  // Category tags matching Figma badges
  const categoryBadges: Record<string, { label: string; bg: string; text: string }> = {
    tutoring: { label: 'Tutoring', bg: colors.badgeGreenBg, text: colors.badgeGreenText },
    tech_repair: { label: 'Popular', bg: colors.badgeBlueBg, text: colors.badgeBlueText },
    photo_video: { label: 'Media', bg: colors.badgePurpleBg, text: colors.badgePurpleText },
    food_delivery: { label: 'Food', bg: colors.badgeGoldBg, text: colors.badgeGoldText },
    fashion_beauty: { label: 'Beauty', bg: colors.badgePinkBg, text: colors.badgePinkText },
    laundry_errands: { label: 'Errands', bg: colors.badgeBlueBg, text: colors.badgeBlueText },
  };

  const badgeMeta = categoryBadges[hustle.category] || {
    label: hustle.category.replace('_', ' '),
    bg: colors.surfaceAlt,
    text: colors.textSecondary,
  };

  // Formatted price string matching Figma (e.g. "GH₵ 80 flat fee", "GH₵ 60 starting from", "GH₵ 40 per hour")
  let priceSuffix = 'flat fee';
  if (hustle.priceType === 'starting_at') priceSuffix = 'starting from';
  else if (hustle.priceType === 'hourly') priceSuffix = 'per hour';

  // Two initials for seller avatar
  const sellerInitials = (hustle.sellerName || 'SH')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0].toUpperCase())
    .slice(0, 2)
    .join('');

  return (
    <TouchableOpacity
      style={[styles.card, isGrid ? styles.cardGrid : styles.cardFull]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* Image Container with Floating Overlays */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
          onError={() => {
            const fallback = getHustleImageUrl(null, hustle.category, hustle.title);
            if (imageUri !== fallback) setImageUri(fallback);
          }}
        />

        {/* Status Badge Overlaid Top Left (Figma) */}
        <View style={[styles.statusBadge, isAvailable ? styles.availableBadge : styles.busyBadge]}>
          <Text style={[styles.statusDot, isAvailable ? styles.availableDot : styles.busyDot]}>●</Text>
          <Text style={[styles.statusText, isAvailable ? styles.availableText : styles.busyText]}>
            {isAvailable ? 'AVAILABLE' : 'BUSY'}
          </Text>
        </View>

        {/* Heart Bookmark Button Overlaid Top Right */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(hustle.id)}
          activeOpacity={0.8}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Text style={styles.heartIcon}>{favorite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>

        {/* Floating Price Pill Overlaid Bottom Left (Figma) */}
        <View style={styles.pricePill}>
          <Text style={styles.priceAmount}>GH₵ {hustle.price}</Text>
          <Text style={styles.priceSuffix}> {priceSuffix}</Text>
        </View>
      </View>

      {/* Card Content Body */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {hustle.title}
        </Text>

        {/* Location & Rating Row (Figma: Location left, Rating right) */}
        <View style={styles.metaRow}>
          <Text style={styles.locationText} numberOfLines={1}>
            📍 {hustle.hostelLocation}
          </Text>
          <View style={styles.ratingRow}>
            <Text style={styles.starIcon}>★</Text>
            <Text style={styles.ratingNumber}>{hustle.rating.toFixed(1)}</Text>
          </View>
        </View>

        {/* Seller Info & Category Tag Row (Figma) */}
        <View style={styles.footerRow}>
          <View style={styles.sellerCluster}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>{sellerInitials}</Text>
            </View>
            <Text style={styles.sellerName} numberOfLines={1}>
              {hustle.sellerName.split(' ')[0]}
            </Text>
          </View>

          <View style={[styles.tagBadge, { backgroundColor: badgeMeta.bg }]}>
            <Text style={[styles.tagText, { color: badgeMeta.text }]}>{badgeMeta.label}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 14,
    ...shadows.card,
  },
  cardGrid: {
    width: '48.5%',
  },
  cardFull: {
    width: '100%',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 125,
    backgroundColor: '#E2E8F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 12,
  },
  availableBadge: {
    backgroundColor: colors.availableBg, // #DCFCE7
  },
  busyBadge: {
    backgroundColor: colors.busyBg, // #FEF3C7
  },
  statusDot: {
    fontSize: 7,
    marginRight: 4,
  },
  availableDot: {
    color: colors.primary,
  },
  busyDot: {
    color: colors.busyDot,
  },
  statusText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  availableText: {
    color: colors.primary,
  },
  busyText: {
    color: colors.busyText,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  heartIcon: {
    fontSize: 13,
  },
  pricePill: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  priceAmount: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  priceSuffix: {
    fontSize: 9.5,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  content: {
    padding: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 17,
    minHeight: 34,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    flex: 1,
    marginRight: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  starIcon: {
    color: colors.ratingStar,
    fontSize: 12,
  },
  ratingNumber: {
    fontSize: 11.5,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  sellerCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  avatarCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.badgeBlueBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  avatarInitials: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.badgeBlueText,
  },
  sellerName: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    flex: 1,
  },
  tagBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
  },
});
