import React, { useState } from 'react';
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
} from 'react-native';
import { useHustleContext } from '../context/HustleContext';
import { initializeMoMoPayment } from '../services/api';

interface HustleDetailScreenProps {
  route: any;
  navigation: any;
}

export const HustleDetailScreen: React.FC<HustleDetailScreenProps> = ({ route, navigation }) => {
  const { hustleId } = route.params;
  const { hustles, isFavorite, toggleFavorite } = useHustleContext();

  const hustle = hustles.find((h) => h.id === hustleId);
  const favorite = isFavorite(hustleId);

  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [buyerEmail, setBuyerEmail] = useState('student@st.knust.edu.gh');
  const [momoNumber, setMomoNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleWhatsAppChat = () => {
    const message = encodeURIComponent(
      `Hi ${hustle.sellerName}, I saw your side-hustle listing "${hustle.title}" on CampusHustle KNUST! Is it still available?`
    );
    const url = `whatsapp://send?phone=${hustle.whatsAppNumber}&text=${message}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          return Linking.openURL(`https://wa.me/${hustle.whatsAppNumber}?text=${message}`);
        }
      })
      .catch(() => {
        Alert.alert(
          'Contact Info',
          `WhatsApp Number: +${hustle.whatsAppNumber}\n\nPlease save this number to chat directly.`
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
      });

      setPaymentModalVisible(false);
      setIsProcessing(false);

      Alert.alert(
        '💳 MoMo Payment Prompt Sent!',
        `A payment prompt of GH₵ ${hustle.price} was sent to ${momoNumber}.\n\nReference: ${response.data.reference}\n\nSeller ${hustle.sellerName} will receive payment notification upon authorization!`,
        [{ text: 'Great!' }]
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

      {/* MoMo Payment Modal */}
      <Modal visible={paymentModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📱 Mobile Money Checkout</Text>
            <Text style={styles.modalSubtitle}>
              Paying <Text style={{ fontWeight: '800' }}>GH₵ {hustle.price}</Text> to {hustle.sellerName}
            </Text>

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
                  {isProcessing ? 'Sending Prompt...' : 'Send MoMo Prompt'}
                </Text>
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
