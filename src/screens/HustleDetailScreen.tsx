import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  SafeAreaView,
  Share,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHustleContext } from '../context/HustleContext';
import {
  formatGhanaPhoneNumber,
  fetchHustleReviewsApi,
  submitHustleReviewApi,
  toggleHustleStatusApi,
  fetchHustleByIdApi,
} from '../services/api';
import { DEFAULT_HUSTLE_IMAGE, getHustleImageUrl } from '../utils/imageHelper';
import { CAMPUS_METADATA } from '../data/mockData';
import { Hustle, Review } from '../types';
import { colors, shadows } from '../theme/colors';

const showAlert = (title: string, message: string, onOk?: () => void) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(`${title}\n\n${message}`);
    }
    if (onOk) onOk();
  } else {
    Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
  }
};

interface HustleDetailScreenProps {
  route: any;
  navigation: any;
}

export const HustleDetailScreen: React.FC<HustleDetailScreenProps> = ({ route, navigation }) => {
  const { hustleId } = route.params;
  const {
    hustles,
    isFavorite,
    toggleFavorite,
    user,
    token,
    setAuthModalVisible,
    updateHustleStatus,
    updateHustleRating,
  } = useHustleContext();

  const listedHustle = hustles.find((h) => h.id === hustleId);
  const [remoteHustle, setRemoteHustle] = useState<Hustle | null>(null);
  const [isLoadingHustle, setIsLoadingHustle] = useState(!listedHustle);
  const hustle = listedHustle || remoteHustle;
  const favorite = isFavorite(hustleId);

  const campusInfo = CAMPUS_METADATA[hustle?.campus || 'knust'] || CAMPUS_METADATA.knust;

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Status Toggle State
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [bannerUri, setBannerUri] = useState<string>(DEFAULT_HUSTLE_IMAGE);

  useEffect(() => {
    if (listedHustle) {
      setRemoteHustle(listedHustle);
      setIsLoadingHustle(false);
      return;
    }

    let cancelled = false;
    setIsLoadingHustle(true);
    fetchHustleByIdApi(hustleId)
      .then((data) => {
        if (!cancelled) setRemoteHustle(data);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingHustle(false);
      });

    return () => {
      cancelled = true;
    };
  }, [hustleId, listedHustle]);

  useEffect(() => {
    if (!hustle) return;
    fetchHustleReviewsApi(hustle.id)
      .then((liveReviews) => {
        setReviews(liveReviews || []);
      })
      .catch(() => {
        setReviews([]);
      });
  }, [hustleId, hustle?.id]);

  useEffect(() => {
    if (!hustle) return;
    setBannerUri(getHustleImageUrl(hustle.imageUrl, hustle.category, hustle.title));
  }, [hustle?.imageUrl, hustle?.category, hustle?.title]);

  if (isLoadingHustle && !hustle) {
    return (
      <SafeAreaView style={styles.notFoundContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.notFoundText, { marginTop: 12 }]}>Loading service…</Text>
      </SafeAreaView>
    );
  }

  if (!hustle) {
    return (
      <SafeAreaView style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Hustle not found or removed.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isOwner = Boolean(user && hustle.sellerId && hustle.sellerId === user.id);
  const status = hustle.status || 'OPEN';

  const deliveryDescriptions: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; detail: string; tag: string }> = {
    to_client: {
      label: 'Hostel Room Service (I come to you)',
      icon: 'send-outline',
      detail: 'Seller will travel to your room/hostel anywhere on campus or hostel area.',
      tag: 'Hostel Delivery',
    },
    at_seller: {
      label: `Client Visits Seller's Room (${hustle.hostelLocation})`,
      icon: 'home-outline',
      detail: `You will visit the seller at their room/hostel in ${hustle.hostelLocation}.`,
      tag: 'At Seller Room',
    },
    campus_spot: {
      label: 'Campus Public Spot Meeting',
      icon: 'people-outline',
      detail: 'Meet at verified safe campus hubs like CCB, Main Library, or Brunei Market.',
      tag: 'Campus Spot',
    },
    remote: {
      label: 'Remote / Online Delivery',
      icon: 'wifi-outline',
      detail: 'Completed digitally via WhatsApp, Zoom, Google Drive, or email.',
      tag: 'Online/Remote',
    },
  };

  const delivery = deliveryDescriptions[hustle.deliveryMode || 'to_client'] || deliveryDescriptions.to_client;

  const handleToggleStatus = async () => {
    const nextStatus = status === 'OPEN' ? 'BUSY' : 'OPEN';
    setIsUpdatingStatus(true);
    updateHustleStatus(hustle.id, nextStatus);

    if (token) {
      try {
        await toggleHustleStatusApi(hustle.id, nextStatus, token);
      } catch (err) {
        console.warn('Status toggle error:', err);
      }
    }
    setIsUpdatingStatus(false);
  };

  const handleOpenReviewModal = () => {
    if (!user) {
      if (Platform.OS === 'web') {
        showAlert(
          'Student Login Required',
          'Please sign in with your student account to rate and review classmates.'
        );
        setAuthModalVisible(true);
        return;
      }
      Alert.alert(
        'Student Login Required',
        'Please sign in with your student account to rate and review classmates.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Log In Now', onPress: () => setAuthModalVisible(true) },
        ]
      );
      return;
    }
    setReviewModalVisible(true);
  };

  const handleSubmitReview = async () => {
    if (!newComment.trim()) {
      showAlert('Missing Comment', 'Please share a few words about your experience with this side-hustler.');
      return;
    }

    if (!token) {
      showAlert('Student Login Required', 'Please log in with your verified student account to write a review.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await submitHustleReviewApi(hustle.id, newRating, newComment.trim(), token);
      const createdReview: Review = res?.data || {
        id: `rev_${Date.now()}`,
        hustleId: hustle.id,
        reviewerId: user?.id,
        reviewerName: user?.name || 'KNUST Student',
        reviewerProgram: user?.program || 'Student',
        rating: newRating,
        comment: newComment.trim(),
        createdAt: new Date().toISOString(),
        isVerifiedPurchase: true,
      };

      const updatedReviews = [createdReview, ...reviews];
      setReviews(updatedReviews);

      const avg = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;
      const roundedRating = Math.round(avg * 10) / 10;
      updateHustleRating(hustle.id, roundedRating, updatedReviews.length);

      setReviewModalVisible(false);
      setNewComment('');
      setNewRating(5);
      showAlert('⭐ Thank You!', `Your review has been verified and published for your fellow ${campusInfo.shortName} classmates.`);
    } catch (err: any) {
      showAlert('Review Notice', err.message || 'Only students who have purchased and received this service can submit a verified review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleWhatsAppChat = () => {
    const cleanPhone = formatGhanaPhoneNumber(hustle.whatsAppNumber);
    const message = encodeURIComponent(
      `Hi ${hustle.sellerName}! I saw your side-hustle "${hustle.title}" on CampusHustle ${campusInfo.shortName}. I'd like to request this service at ${hustle.hostelLocation} for GH₵ ${hustle.price}. Are you available?`
    );
    const webUrl = `https://wa.me/${cleanPhone}?text=${message}`;

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.open(webUrl, '_blank');
      }
      return;
    }

    const appUrl = `whatsapp://send?phone=${cleanPhone}&text=${message}`;
    Linking.canOpenURL(appUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(appUrl);
        } else {
          return Linking.openURL(webUrl);
        }
      })
      .catch(() => {
        Linking.openURL(webUrl).catch(() => {
          showAlert(
            'Contact Info',
            `WhatsApp Number: +${cleanPhone}\n\nPlease save this number to chat directly.`
          );
        });
      });
  };

  const handleShare = async () => {
    try {
      const shareData = {
        message: `Check out this ${campusInfo.shortName} student hustle: "${hustle.title}" by ${hustle.sellerName} for GH₵ ${hustle.price} on CampusHustle!`,
      };
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.message);
        showAlert('Link Copied!', 'Hustle details copied to your clipboard!');
      } else {
        await Share.share(shareData);
      }
    } catch (error) {
      // Ignored
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner Image */}
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: bannerUri }}
            style={styles.bannerImage}
            onError={() => {
              const fallback = getHustleImageUrl(null, hustle.category, hustle.title);
              if (bannerUri !== fallback) {
                setBannerUri(fallback);
              }
            }}
          />

          <TouchableOpacity
            style={styles.topBackNav}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.topNavIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.topRightNav}>
            <TouchableOpacity
              style={styles.circleBtn}
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <Ionicons name="share-social-outline" size={18} color="#0F172A" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.circleBtn}
              onPress={() => toggleFavorite(hustle.id)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={favorite ? 'heart' : 'heart-outline'}
                size={18}
                color={favorite ? '#EF4444' : '#0F172A'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Body */}
        <View style={styles.body}>
          {/* Status & Availability Banner */}
          <View style={[styles.statusBanner, status === 'OPEN' ? styles.statusBannerOpen : styles.statusBannerBusy]}>
            <View style={styles.statusBannerLeft}>
              <View style={[styles.statusDot, status === 'OPEN' ? styles.statusDotOpen : styles.statusDotBusy]} />
              <View>
                <Text style={styles.statusBannerTitle}>
                  {status === 'OPEN' ? 'Available for Bookings' : 'Currently Busy with Lectures/Exams'}
                </Text>
                <Text style={styles.statusBannerSub}>
                  {status === 'OPEN'
                    ? 'Seller is accepting requests right now.'
                    : 'Response may be delayed due to class or study schedule.'}
                </Text>
              </View>
            </View>

            {isOwner && (
              <TouchableOpacity
                style={styles.statusToggleBtn}
                onPress={handleToggleStatus}
                disabled={isUpdatingStatus}
                activeOpacity={0.8}
              >
                <Text style={styles.statusToggleBtnText}>
                  {status === 'OPEN' ? 'Set Busy' : 'Set Available'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Location & Category Badges */}
          <View style={styles.badgeRow}>
            <View style={styles.hostelBadge}>
              <Ionicons name="location-outline" size={13} color="#475569" style={{ marginRight: 4 }} />
              <Text style={styles.hostelBadgeText}>{hustle.hostelLocation}</Text>
            </View>
            <View style={styles.campusTag}>
              <Text style={styles.campusTagText}>{campusInfo.shortName} {campusInfo.city}</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{hustle.title}</Text>

          {/* Price Header Card */}
          <View style={styles.priceCard}>
            <View>
              <Text style={styles.priceLabel}>Service Price / Rate</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceCurrency}>GH₵</Text>
                <Text style={styles.priceValue}>{hustle.price}</Text>
                <Text style={styles.priceType}>
                  {hustle.priceType === 'hourly'
                    ? ' per hour'
                    : hustle.priceType === 'starting_at'
                    ? ' starting rate'
                    : ' flat price'}
                </Text>
              </View>
            </View>

            <View style={styles.ratingBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="star" size={15} color="#F59E0B" />
                <Text style={styles.starBig}>{Number(hustle.rating || 0).toFixed(1)}</Text>
              </View>
              <Text style={styles.reviewSubText}>{hustle.reviewCount} student reviews</Text>
            </View>
          </View>

          {/* Delivery & Meeting Mode Card */}
          <View style={styles.deliveryCard}>
            <View style={styles.deliveryCardHeader}>
              <View style={styles.deliveryIconWrapper}>
                <Ionicons name={delivery.icon} size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.deliveryCardTitle}>{delivery.label}</Text>
                <Text style={styles.deliveryCardDetail}>{delivery.detail}</Text>
              </View>
            </View>
          </View>

          {/* Seller Profile Card */}
          <View style={styles.sellerCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>{hustle.sellerName.charAt(0)}</Text>
            </View>
            <View style={styles.sellerDetails}>
              <Text style={styles.sellerTitle}>{hustle.sellerName}</Text>
              <Text style={styles.sellerSub}>{hustle.sellerProgram}</Text>
              <Text style={styles.sellerHostel}>Based in {hustle.hostelLocation}</Text>
              {hustle.momoNumber ? (
                <Text style={styles.sellerHostel}>MoMo: {hustle.momoNumber} (pay the seller directly)</Text>
              ) : null}
            </View>
            <View style={styles.verifiedBadge}>
              <Ionicons name="school-outline" size={13} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={styles.verifiedText}>Verified Student</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.sectionHeader}>About this Side-Hustle</Text>
          <Text style={styles.descriptionText}>{hustle.description}</Text>

          {/* Tags */}
          <View style={styles.tagsContainer}>
            {hustle.tags.map((tag) => (
              <View key={tag} style={styles.tagPill}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>

          {/* Safety Notice */}
          <View style={styles.safetyBox}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.safetyText}>
              Meet in a public campus spot. Agree the price on WhatsApp, then pay the seller directly with MoMo or cash when you are satisfied.
            </Text>
          </View>

          {/* Classmate Reviews Section */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeaderRow}>
              <View>
                <Text style={styles.sectionHeader}>Classmate Reviews</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  <Ionicons name="star" size={13} color="#F59E0B" style={{ marginRight: 4 }} />
                  <Text style={styles.reviewsSub}>
                    {hustle.rating.toFixed(1)} avg from {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.leaveReviewBtn}
                onPress={handleOpenReviewModal}
                activeOpacity={0.85}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="create-outline" size={13} color={colors.primary} />
                  <Text style={styles.leaveReviewBtnText}>Write Review</Text>
                </View>
              </TouchableOpacity>
            </View>

            {reviews.length === 0 ? (
              <View style={styles.emptyReviews}>
                <Text style={styles.emptyReviewsText}>
                  No reviews yet. Be the first classmate to review {hustle.sellerName}'s work.
                </Text>
              </View>
            ) : (
              reviews.map((rev) => (
                <View key={rev.id} style={styles.reviewItem}>
                  <View style={styles.reviewItemHeader}>
                    <View style={styles.reviewAvatar}>
                      <Text style={styles.reviewAvatarText}>{rev.reviewerName.charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                        <Text style={styles.reviewerName}>{rev.reviewerName}</Text>
                        {rev.isVerifiedPurchase && (
                          <View style={styles.verifiedReviewBadge}>
                            <Ionicons name="checkmark-circle" size={11} color="#15803D" style={{ marginRight: 3 }} />
                            <Text style={styles.verifiedReviewBadgeText}>Verified Purchase</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.reviewerProgram}>{rev.reviewerProgram}</Text>
                    </View>
                    <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Ionicons
                          key={s}
                          name="star"
                          size={12}
                          color={s <= rev.rating ? '#F59E0B' : '#CBD5E1'}
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>{rev.comment}</Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.whatsAppButton}
          onPress={handleWhatsAppChat}
          activeOpacity={0.85}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" />
            <Text style={styles.whatsAppText}>Chat on WhatsApp · GH₵ {hustle.price}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Write a Review Modal */}
      <Modal visible={reviewModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Review {hustle.sellerName}</Text>
            <Text style={styles.modalSubtitle}>
              Share honest feedback about "{hustle.title}" to help fellow {campusInfo.shortName} students.
            </Text>

            {/* Star Rating Selector */}
            <View style={styles.starPickerRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setNewRating(star)}
                  style={styles.starPickerItem}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="star"
                    size={28}
                    color={star <= newRating ? '#F59E0B' : '#E2E8F0'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.ratingDescriptor}>
              {newRating === 5
                ? 'Excellent / Highly Recommended'
                : newRating === 4
                ? 'Very Good Service'
                : newRating === 3
                ? 'Average / Decent'
                : newRating === 2
                ? 'Needs Improvement'
                : 'Poor Experience'}
            </Text>

            {/* Comment Input */}
            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>Your Feedback *</Text>
              <TextInput
                style={[styles.modalInput, { height: 90, textAlignVertical: 'top' }]}
                placeholder="How was the punctuality, communication, and quality of work?"
                multiline
                numberOfLines={3}
                value={newComment}
                onChangeText={setNewComment}
              />
            </View>

            {/* Modal Buttons */}
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setReviewModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitReviewBtn}
                onPress={handleSubmitReview}
                disabled={isSubmittingReview}
              >
                {isSubmittingReview ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitReviewBtnText}>Post Review</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  bannerContainer: {
    height: 250,
    width: '100%',
    position: 'relative',
    backgroundColor: colors.surfaceAlt,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  topBackNav: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRightNav: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  circleBtn: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topNavIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  body: {
    padding: 18,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  hostelBadge: {
    backgroundColor: colors.busyBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  hostelBadgeText: {
    color: colors.busyText,
    fontSize: 12,
    fontWeight: '700',
  },
  campusTag: {
    backgroundColor: colors.badgeBlueBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  campusTagText: {
    color: colors.badgeBlueText,
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 14,
    lineHeight: 28,
  },
  priceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
    ...shadows.card,
  },
  priceLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  priceCurrency: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
    marginRight: 2,
  },
  priceValue: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary,
  },
  priceType: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  ratingBox: {
    alignItems: 'flex-end',
  },
  starBig: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.ratingStar,
  },
  reviewSubText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 20,
    ...shadows.card,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  sellerDetails: {
    flex: 1,
  },
  sellerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  sellerSub: {
    fontSize: 12,
    color: '#475569',
  },
  sellerHostel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  verifiedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  verifiedText: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '700',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 20,
  },
  tagPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  safetyBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  safetyIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  safetyText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 17,
  },
  // Status banner
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
  },
  statusBannerOpen: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  statusBannerBusy: {
    backgroundColor: '#FEFCE8',
    borderColor: '#FEF08A',
  },
  statusBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusDotOpen: {
    backgroundColor: '#16A34A',
  },
  statusDotBusy: {
    backgroundColor: '#CA8A04',
  },
  statusBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  statusBannerSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  statusToggleBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 10,
  },
  statusToggleBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // Delivery mode card
  deliveryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  deliveryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deliveryIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryCardIcon: {
    fontSize: 26,
  },
  deliveryCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  deliveryCardDetail: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },

  // Reviews Section
  reviewsSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
    marginBottom: 20,
  },
  reviewsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  reviewsSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  leaveReviewBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  leaveReviewBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyReviews: {
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyReviewsText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  reviewItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  reviewItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewAvatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  verifiedReviewBadge: {
    backgroundColor: colors.primaryMint,
    borderWidth: 1,
    borderColor: colors.primaryMintBorder,
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  verifiedReviewBadgeText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '700',
  },
  reviewerProgram: {
    fontSize: 11,
    color: '#64748B',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 1,
  },
  reviewComment: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    marginLeft: 42,
  },

  // Star Picker
  starPickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 12,
  },
  starPickerItem: {
    padding: 6,
  },
  starPickerText: {
    fontSize: 32,
    color: '#CBD5E1',
  },
  starPickerActive: {
    color: '#F59E0B',
  },
  ratingDescriptor: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 16,
  },
  submitReviewBtn: {
    flex: 1.5,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitReviewBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    padding: 14,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    ...shadows.cardHover,
  },
  whatsAppButton: {
    backgroundColor: '#25D366',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },
  whatsAppIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  whatsAppText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  escrowHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  escrowBadgeIcon: {
    fontSize: 22,
  },
  escrowBadgeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
  },
  escrowBadgeSub: {
    fontSize: 11,
    color: '#047857',
    marginTop: 1,
  },
  meetupScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  meetupChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  meetupChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  meetupChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  meetupChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  safetyChecklistBox: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  safetyChecklistTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  safetyChecklistItem: {
    fontSize: 11,
    color: '#78350F',
    lineHeight: 16,
  },
  modalInputGroup: {
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#475569',
    fontWeight: '700',
  },
  modalSubmitBtn: {
    flex: 1.5,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    ...shadows.fab,
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 12,
  },
  backBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
