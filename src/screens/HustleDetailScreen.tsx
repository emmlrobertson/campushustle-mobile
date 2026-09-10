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
} from 'react-native';
import { useHustleContext } from '../context/HustleContext';
import {
  initializeMoMoPayment,
  formatGhanaPhoneNumber,
  fetchHustleReviewsApi,
  submitHustleReviewApi,
  toggleHustleStatusApi,
} from '../services/api';
import { SAMPLE_REVIEWS } from '../data/mockData';
import { Review } from '../types';

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

  const hustle = hustles.find((h) => h.id === hustleId);
  const favorite = isFavorite(hustleId);

  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [buyerEmail, setBuyerEmail] = useState('student@st.knust.edu.gh');
  const [momoNumber, setMomoNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMeetupSpot, setSelectedMeetupSpot] = useState('🏛️ CCB Ground Floor (Near Commercial Bank)');

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Status Toggle State
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    if (!hustle) return;
    const initialReviews = SAMPLE_REVIEWS[hustle.id] || [];
    setReviews(initialReviews);

    // Fetch live reviews from backend API
    fetchHustleReviewsApi(hustle.id)
      .then((liveReviews) => {
        if (liveReviews && liveReviews.length > 0) {
          setReviews(liveReviews);
        }
      })
      .catch(() => {});
  }, [hustleId]);

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

  const deliveryDescriptions: Record<string, { label: string; icon: string; detail: string; tag: string }> = {
    to_client: {
      label: 'Hostel Room Service (I come to you)',
      icon: '🏠',
      detail: 'Seller will travel to your room/hostel anywhere on campus or Ayeduase/Kotei/Brunei.',
      tag: 'Hostel Delivery',
    },
    at_seller: {
      label: `Client Visits Seller's Room (${hustle.hostelLocation})`,
      icon: '📍',
      detail: `You will visit the seller at their room/hostel in ${hustle.hostelLocation}.`,
      tag: 'At Seller Room',
    },
    campus_spot: {
      label: 'Campus Public Spot Meeting',
      icon: '🎓',
      detail: 'Meet at verified safe campus hubs like CCB, Main Library, or Brunei Market.',
      tag: 'Campus Spot',
    },
    remote: {
      label: 'Remote / Online Delivery',
      icon: '💻',
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
      Alert.alert('Missing Comment', 'Please share a few words about your experience with this side-hustler.');
      return;
    }

    setIsSubmittingReview(true);
    const localReview: Review = {
      id: `rev_${Date.now()}`,
      hustleId: hustle.id,
      reviewerId: user?.id,
      reviewerName: user?.name || 'KNUST Student',
      reviewerProgram: user?.program || 'Level 200',
      rating: newRating,
      comment: newComment.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedReviews = [localReview, ...reviews];
    setReviews(updatedReviews);

    // Recalculate average rating & count
    const avg = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;
    const roundedRating = Math.round(avg * 10) / 10;
    const newCount = updatedReviews.length;
    updateHustleRating(hustle.id, roundedRating, newCount);

    if (token) {
      try {
        await submitHustleReviewApi(hustle.id, newRating, newComment.trim(), token);
      } catch (err) {
        console.warn('Review API error:', err);
      }
    }

    setIsSubmittingReview(false);
    setReviewModalVisible(false);
    setNewComment('');
    setNewRating(5);

    Alert.alert('⭐ Thank You!', 'Your review has been published for your fellow KNUST classmates.');
  };

  const handleWhatsAppChat = () => {
    const cleanPhone = formatGhanaPhoneNumber(hustle.whatsAppNumber);
    const message = encodeURIComponent(
      `Hi ${hustle.sellerName}! I saw your side-hustle "${hustle.title}" on CampusHustle KNUST. I'd like to request this service at ${hustle.hostelLocation} for GH₵ ${hustle.price}. Are you available?`
    );
    const url = `whatsapp://send?phone=${cleanPhone}&text=${message}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          return Linking.openURL(`https://wa.me/${cleanPhone}?text=${message}`);
        }
      })
      .catch(() => {
        Alert.alert(
          'Contact Info',
          `WhatsApp Number: +${cleanPhone}\n\nPlease save this number to chat directly.`
        );
      });
  };

  const handleInitiateMoMoPayment = async () => {
    if (!momoNumber.trim() || momoNumber.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit Ghana Mobile Money phone number.');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await initializeMoMoPayment({
        hustleId: hustle.id,
        buyerEmail,
        momoNumber,
        paymentMethod: 'mtn_momo',
        meetupSpot: selectedMeetupSpot,
      });

      setPaymentModalVisible(false);
      setIsProcessing(false);

      Alert.alert(
        '🛡️ Campus Escrow Protected!',
        `A payment prompt of GH₵ ${hustle.price} was sent to ${momoNumber}.\n\n📍 Meetup Location: ${selectedMeetupSpot}\nReference: ${response.data.reference}\n\nFunds remain safely held in Campus Escrow until you confirm service delivery in your Profile screen!`,
        [{ text: 'Great, Understood!' }]
      );
    } catch (error: any) {
      setIsProcessing(false);
      Alert.alert('Payment Error', error.message || 'Unable to connect to MoMo gateway.');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this KNUST student hustle: "${hustle.title}" by ${hustle.sellerName} for GH₵ ${hustle.price} on CampusHustle!`,
      });
    } catch (error) {
      // Ignored
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner Image */}
        <View style={styles.bannerContainer}>
          <Image source={{ uri: hustle.imageUrl }} style={styles.bannerImage} />

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
              <Text style={styles.topNavIcon}>🔗</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.circleBtn}
              onPress={() => toggleFavorite(hustle.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.topNavIcon}>{favorite ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Body */}
        <View style={styles.body}>
          {/* Status & Availability Banner */}
          <View style={[styles.statusBanner, status === 'OPEN' ? styles.statusBannerOpen : styles.statusBannerBusy]}>
            <View style={styles.statusBannerLeft}>
              <Text style={[styles.statusDot, status === 'OPEN' ? styles.statusDotOpen : styles.statusDotBusy]}>●</Text>
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
              <Text style={styles.hostelBadgeText}>📍 {hustle.hostelLocation}</Text>
            </View>
            <View style={styles.campusTag}>
              <Text style={styles.campusTagText}>KNUST Kumasi</Text>
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
              <Text style={styles.starBig}>⭐ {hustle.rating.toFixed(1)}</Text>
              <Text style={styles.reviewSubText}>{hustle.reviewCount} student reviews</Text>
            </View>
          </View>

          {/* Delivery & Meeting Mode Card */}
          <View style={styles.deliveryCard}>
            <View style={styles.deliveryCardHeader}>
              <Text style={styles.deliveryCardIcon}>{delivery.icon}</Text>
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
            </View>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>🎓 Verified Student</Text>
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
            <Text style={styles.safetyIcon}>💡</Text>
            <Text style={styles.safetyText}>
              Meet in public campus spots (CCB, Library, Hostel Lounge) when ordering or receiving services. Pay via MoMo or Cash upon satisfaction!
            </Text>
          </View>

          {/* Classmate Reviews Section */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeaderRow}>
              <View>
                <Text style={styles.sectionHeader}>Classmate Reviews</Text>
                <Text style={styles.reviewsSub}>
                  ⭐ {hustle.rating.toFixed(1)} avg from {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.leaveReviewBtn}
                onPress={handleOpenReviewModal}
                activeOpacity={0.85}
              >
                <Text style={styles.leaveReviewBtnText}>⭐ Write Review</Text>
              </TouchableOpacity>
            </View>

            {reviews.length === 0 ? (
              <View style={styles.emptyReviews}>
                <Text style={styles.emptyReviewsText}>
                  No reviews yet. Be the first classmate to review {hustle.sellerName}'s work!
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
                      <Text style={styles.reviewerName}>{rev.reviewerName}</Text>
                      <Text style={styles.reviewerProgram}>{rev.reviewerProgram}</Text>
                    </View>
                    <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Text key={s} style={{ fontSize: 13, color: s <= rev.rating ? '#F59E0B' : '#CBD5E1' }}>
                          ★
                        </Text>
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

      {/* Floating Action Bar with WhatsApp + MoMo Payment */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.payMomoButton}
          onPress={() => setPaymentModalVisible(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.payMomoIcon}>💳</Text>
          <Text style={styles.payMomoText}>Pay GH₵ {hustle.price}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.whatsAppButton}
          onPress={handleWhatsAppChat}
          activeOpacity={0.85}
        >
          <Text style={styles.whatsAppIcon}>💬</Text>
          <Text style={styles.whatsAppText}>Chat</Text>
        </TouchableOpacity>
      </View>

      {/* MoMo Payment & Campus Escrow Modal */}
      <Modal visible={paymentModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.escrowHeaderBadge}>
                <Text style={styles.escrowBadgeIcon}>🛡️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.escrowBadgeTitle}>Campus Escrow Protection</Text>
                  <Text style={styles.escrowBadgeSub}>
                    Funds are held safely until service is delivered & verified.
                  </Text>
                </View>
              </View>

              <Text style={styles.modalTitle}>📱 Secure MoMo Checkout</Text>
              <Text style={styles.modalSubtitle}>
                Holding <Text style={{ fontWeight: '800', color: '#059669' }}>GH₵ {hustle.price}</Text> for {hustle.sellerName}
              </Text>

              {/* Safe Meetup Spot Selection */}
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>📍 Safe Campus Meetup Spot *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.meetupScroll}>
                  {[
                    '🏛️ CCB Ground Floor',
                    '📚 Main Library Forecourt',
                    '🏪 Brunei Complex Market',
                    '🏢 Hall Porter’s Lodge',
                    '🍽️ Royal Parade Grounds',
                    '🏠 Private Hostel Room',
                  ].map((spot) => {
                    const isSelected = selectedMeetupSpot.includes(spot.substring(3));
                    return (
                      <TouchableOpacity
                        key={spot}
                        style={[styles.meetupChip, isSelected && styles.meetupChipActive]}
                        onPress={() => setSelectedMeetupSpot(spot)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.meetupChipText, isSelected && styles.meetupChipTextActive]}>
                          {spot}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Safety Checklist Box */}
              <View style={styles.safetyChecklistBox}>
                <Text style={styles.safetyChecklistTitle}>KNUST Student Safety Checklist</Text>
                <Text style={styles.safetyChecklistItem}>✓ Meet in public, well-lit campus spots</Text>
                <Text style={styles.safetyChecklistItem}>✓ Inspect service/item before releasing payment</Text>
                <Text style={styles.safetyChecklistItem}>✓ Release escrow funds in your Profile when satisfied</Text>
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Student Email</Text>
                <TextInput
                  style={styles.modalInput}
                  value={buyerEmail}
                  onChangeText={setBuyerEmail}
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>MTN / Telecel MoMo Number *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 0241234567"
                  keyboardType="phone-pad"
                  value={momoNumber}
                  onChangeText={setMomoNumber}
                />
              </View>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setPaymentModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalSubmitBtn}
                  onPress={handleInitiateMoMoPayment}
                  disabled={isProcessing}
                >
                  <Text style={styles.modalSubmitText}>
                    {isProcessing ? 'Sending Prompt...' : '🔒 Pay with Escrow'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Write a Review Modal */}
      <Modal visible={reviewModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⭐ Review {hustle.sellerName}</Text>
            <Text style={styles.modalSubtitle}>
              Share honest feedback about "{hustle.title}" to help fellow KNUST students.
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
                  <Text style={[styles.starPickerText, star <= newRating && styles.starPickerActive]}>
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.ratingDescriptor}>
              {newRating === 5
                ? 'Excellent / Highly Recommended! 🌟'
                : newRating === 4
                ? 'Very Good Service 👍'
                : newRating === 3
                ? 'Average / Decent ⚖️'
                : newRating === 2
                ? 'Needs Improvement ⚠️'
                : 'Poor Experience ❌'}
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
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 90,
  },
  bannerContainer: {
    height: 240,
    width: '100%',
    position: 'relative',
    backgroundColor: '#1E3A8A',
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
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  hostelBadgeText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '700',
  },
  campusTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  campusTagText: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 14,
    lineHeight: 28,
  },
  priceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 11,
    color: '#64748B',
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
    color: '#1E3A8A',
    marginRight: 2,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  priceType: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  ratingBox: {
    alignItems: 'flex-end',
  },
  starBig: {
    fontSize: 16,
    fontWeight: '800',
    color: '#D97706',
  },
  reviewSubText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E3A8A',
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
    fontSize: 14,
  },
  statusDotOpen: {
    color: '#16A34A',
  },
  statusDotBusy: {
    color: '#CA8A04',
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
    backgroundColor: '#1E3A8A',
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
    backgroundColor: '#059669',
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
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    padding: 14,
    flexDirection: 'row',
    gap: 10,
  },
  payMomoButton: {
    flex: 1.4,
    backgroundColor: '#F59E0B',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },
  payMomoIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  payMomoText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  whatsAppButton: {
    flex: 1,
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
    backgroundColor: '#059669',
    borderColor: '#059669',
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
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
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
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
