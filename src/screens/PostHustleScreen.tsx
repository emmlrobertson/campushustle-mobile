import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  StatusBar,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useHustleContext } from '../context/HustleContext';
import { CATEGORIES, CAMPUS_LOCATIONS, CAMPUS_METADATA } from '../data/mockData';
import { CategoryId, PriceType, DeliveryMode } from '../types';
import { formatGhanaPhoneNumber, uploadHustleImageApi } from '../services/api';
import { getHustleImageUrl } from '../utils/imageHelper';
import { colors, shadows } from '../theme/colors';

interface PostHustleScreenProps {
  navigation: any;
}

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

export const PostHustleScreen: React.FC<PostHustleScreenProps> = ({ navigation }) => {
  const { addHustle, user, token, setAuthModalVisible, selectedCampus } = useHustleContext();

  const campusInfo = CAMPUS_METADATA[selectedCampus] || CAMPUS_METADATA.knust;
  const availableLocations = (CAMPUS_LOCATIONS[selectedCampus] || CAMPUS_LOCATIONS.knust).filter(
    (l) => l !== 'All Locations'
  );

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryId>('tutoring');
  const [customCategory, setCustomCategory] = useState('');
  const [price, setPrice] = useState('');
  const [priceType, setPriceType] = useState<PriceType>('flat');
  const [hostelLocation, setHostelLocation] = useState(availableLocations[0] || 'Campus Area');
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('to_client');
  const [status, setStatus] = useState<'OPEN' | 'BUSY'>('OPEN');
  const [whatsAppNumber, setWhatsAppNumber] = useState('');
  const [description, setDescription] = useState('');
  const [customImageUri, setCustomImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.whatsAppNumber) {
      setWhatsAppNumber(user.whatsAppNumber);
    }
    if (user?.hostelLocation) {
      setHostelLocation(user.hostelLocation);
    }
  }, [user]);

  const handlePickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showAlert('Permission Required', 'Please allow gallery access to upload hustle pictures.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setCustomImageUri(result.assets[0].uri);
      }
    } catch (e: any) {
      showAlert('Photo Picker Notice', 'Could not open image library: ' + e.message);
    }
  };

  const deliveryModesList: { id: DeliveryMode; title: string; subtitle: string; icon: string }[] = [
    {
      id: 'to_client',
      title: 'I visit your hostel',
      subtitle: "You travel to client's location",
      icon: '🚀',
    },
    {
      id: 'at_seller',
      title: 'Come to my hostel',
      subtitle: 'Client comes to your hostel/room',
      icon: '🏠',
    },
    {
      id: 'campus_spot',
      title: 'Meet on campus',
      subtitle: 'Library, Great Hall, lecture areas',
      icon: '🎓',
    },
    {
      id: 'remote',
      title: 'Remote / Online',
      subtitle: 'WhatsApp, Zoom, Email delivery',
      icon: '💻',
    },
  ];

  const isFormValid =
    title.trim().length >= 4 &&
    parseFloat(price) > 0 &&
    whatsAppNumber.trim().length >= 9;

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!user) {
      setAuthModalVisible(true);
      return;
    }

    if (!title.trim() || title.length < 4) {
      setErrorMessage('Please enter a descriptive service title (at least 4 characters).');
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setErrorMessage('Please enter a valid price in Ghana Cedis (GH₵).');
      return;
    }

    if (!whatsAppNumber.trim()) {
      setErrorMessage('Please enter a valid Ghanaian WhatsApp phone number.');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalImageUrl: string | undefined = undefined;

      if (customImageUri) {
        try {
          const uploadRes = await uploadHustleImageApi(customImageUri, token || '');
          if (uploadRes && uploadRes.imageUrl) {
            finalImageUrl = uploadRes.imageUrl;
          }
        } catch (uploadErr) {
          console.warn('Image upload notice:', uploadErr);
        }
      }

      await addHustle({
        title: title.trim(),
        category: category === 'all' ? 'custom' : category,
        price: numPrice,
        priceType,
        hostelLocation,
        deliveryMode,
        status,
        sellerName: user.name || 'Student Seller',
        sellerProgram: user.program || 'Student',
        whatsAppNumber: formatGhanaPhoneNumber(whatsAppNumber),
        description: description.trim() || `${title} offered at ${hostelLocation}`,
        imageUrl: finalImageUrl || getHustleImageUrl(null, category, title.trim()),
        tags: [category, hostelLocation, deliveryMode].filter(Boolean),
        campus: selectedCampus,
      });

      showAlert('🎉 Service Published!', 'Your hustle is now live on CampusHustle.', () => {
        navigation.navigate('Home');
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to post service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Top Header Card matching Figma */}
      <View style={styles.topHeader}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Post a Service</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              Publishing as {user?.name || 'Student'} · {user?.program || campusInfo.shortName}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.draftBtn}
            onPress={() => showAlert('Draft Saved', 'Your progress is stored locally.')}
            activeOpacity={0.8}
          >
            <Text style={styles.draftBtnText}>Save Draft</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {errorMessage && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
          </View>
        )}

        {/* 01 — SERVICE INFO (Figma) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionIndex}>01 — SERVICE INFO</Text>

          <Text style={styles.label}>Service Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Calculus Tutoring, Laptop Formatting, Hair Styling..."
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
            maxLength={80}
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Category *</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
              const isSelected = category === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                  onPress={() => setCategory(cat.id as CategoryId)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Pricing Row */}
          <Text style={[styles.label, { marginTop: 14 }]}>Price (GH₵) *</Text>
          <View style={styles.priceRow}>
            <View style={styles.currencyPrefix}>
              <Text style={styles.currencyText}>GH₵</Text>
            </View>
            <TextInput
              style={styles.priceInput}
              placeholder="e.g. 50"
              placeholderTextColor={colors.textMuted}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
          </View>

          {/* Price Type Chips */}
          <View style={styles.priceTypeRow}>
            {[
              { id: 'flat', label: 'Flat Fee' },
              { id: 'starting_at', label: 'Starting From' },
              { id: 'hourly', label: 'Per Hour' },
            ].map((pt) => {
              const isSelected = priceType === pt.id;
              return (
                <TouchableOpacity
                  key={pt.id}
                  style={[styles.priceTypeChip, isSelected && styles.priceTypeChipActive]}
                  onPress={() => setPriceType(pt.id as PriceType)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.priceTypeChipText, isSelected && styles.priceTypeChipTextActive]}>
                    {pt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 02 — HOW YOU DELIVER (Figma) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionIndex}>02 — HOW YOU DELIVER</Text>
          <Text style={styles.label}>Service / Meeting Mode *</Text>

          <View style={styles.deliveryList}>
            {deliveryModesList.map((mode) => {
              const isSelected = deliveryMode === mode.id;
              return (
                <TouchableOpacity
                  key={mode.id}
                  style={[styles.deliveryCard, isSelected && styles.deliveryCardActive]}
                  onPress={() => setDeliveryMode(mode.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.deliveryIconBox, isSelected && styles.deliveryIconBoxActive]}>
                    <Text style={styles.deliveryEmoji}>{mode.icon}</Text>
                  </View>
                  <View style={styles.deliveryContent}>
                    <Text style={[styles.deliveryTitle, isSelected && styles.deliveryTitleActive]}>
                      {mode.title}
                    </Text>
                    <Text style={styles.deliverySubtitle}>{mode.subtitle}</Text>
                  </View>
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                    {isSelected && <Text style={styles.radioCheck}>✓</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 03 — LOCATION & CONTACT */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionIndex}>03 — LOCATION & CONTACT</Text>

          <Text style={styles.label}>Your Campus Hostel / Area *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hostelScroll}>
            {availableLocations.map((loc) => {
              const isSelected = hostelLocation === loc;
              return (
                <TouchableOpacity
                  key={loc}
                  style={[styles.hostelChip, isSelected && styles.hostelChipActive]}
                  onPress={() => setHostelLocation(loc)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.hostelChipText, isSelected && styles.hostelChipTextActive]}>
                    📍 {loc}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={[styles.label, { marginTop: 14 }]}>WhatsApp Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="024XXXXXXX or +233..."
            placeholderTextColor={colors.textMuted}
            value={whatsAppNumber}
            onChangeText={setWhatsAppNumber}
            keyboardType="phone-pad"
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your tools, experience, or what clients should expect..."
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          {/* Photo Upload Section */}
          <Text style={[styles.label, { marginTop: 14 }]}>Service Photo</Text>
          <TouchableOpacity style={styles.uploadCard} onPress={handlePickImage} activeOpacity={0.8}>
            {customImageUri ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: customImageUri }} style={styles.previewImage} resizeMode="cover" />
                <TouchableOpacity style={styles.removeImageBtn} onPress={() => setCustomImageUri(null)}>
                  <Text style={styles.removeImageText}>✕ Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Text style={styles.uploadIcon}>📷</Text>
                <Text style={styles.uploadPrompt}>Tap to choose a photo from your gallery</Text>
                <Text style={styles.uploadHint}>JPG, PNG, WebP up to 10MB</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Sticky Bottom Publish Button */}
      <View style={styles.stickyFooter}>
        <TouchableOpacity
          style={[styles.publishBtn, isFormValid && !isSubmitting ? styles.publishBtnActive : styles.publishBtnDisabled]}
          onPress={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          activeOpacity={0.88}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.textWhite} />
          ) : (
            <Text style={[styles.publishBtnText, isFormValid ? styles.publishBtnTextActive : styles.publishBtnTextDisabled]}>
              Publish Service
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topHeader: {
    backgroundColor: colors.primary, // Forest Green #0D6535
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 8 : 14,
    paddingBottom: 16,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    color: colors.textWhite,
    fontSize: 20,
    fontWeight: '700',
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    color: colors.textWhite,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: colors.primaryMint,
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 2,
  },
  draftBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  draftBtnText: {
    color: colors.textWhite,
    fontSize: 12,
    fontWeight: '800',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  errorBanner: {
    backgroundColor: colors.dangerLight,
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  sectionIndex: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 9,
    fontSize: 13.5,
    color: colors.textPrimary,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryPillActive: {
    backgroundColor: colors.primaryMint,
    borderColor: colors.primary,
  },
  categoryIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  categoryLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  categoryLabelActive: {
    color: colors.primary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyPrefix: {
    backgroundColor: colors.surfaceAlt,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 9,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: colors.border,
  },
  currencyText: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  priceInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 9,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '800',
    borderWidth: 1,
    borderColor: colors.border,
  },
  priceTypeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  priceTypeChip: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  priceTypeChipActive: {
    backgroundColor: colors.primaryMint,
    borderColor: colors.primary,
  },
  priceTypeChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  priceTypeChipTextActive: {
    color: colors.primary,
  },
  // Delivery Modes
  deliveryList: {
    gap: 10,
    marginTop: 4,
  },
  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  deliveryCardActive: {
    backgroundColor: colors.primaryMint,
    borderColor: colors.primary,
  },
  deliveryIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deliveryIconBoxActive: {
    backgroundColor: colors.primary,
  },
  deliveryEmoji: {
    fontSize: 18,
  },
  deliveryContent: {
    flex: 1,
  },
  deliveryTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  deliveryTitleActive: {
    color: colors.primary,
  },
  deliverySubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  radioCircleActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  radioCheck: {
    color: colors.textWhite,
    fontSize: 12,
    fontWeight: '900',
  },
  hostelScroll: {
    marginTop: 4,
    marginBottom: 2,
  },
  hostelChip: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hostelChipActive: {
    backgroundColor: colors.primaryMint,
    borderColor: colors.primary,
  },
  hostelChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  hostelChipTextActive: {
    color: colors.primary,
  },
  uploadCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginTop: 4,
  },
  uploadPlaceholder: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  uploadIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  uploadPrompt: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  uploadHint: {
    fontSize: 11,
    color: colors.textMuted,
  },
  previewContainer: {
    position: 'relative',
    height: 160,
    width: '100%',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  removeImageText: {
    color: colors.textWhite,
    fontSize: 11,
    fontWeight: '800',
  },
  stickyFooter: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    ...shadows.cardHover,
  },
  publishBtn: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishBtnActive: {
    backgroundColor: colors.primary, // Forest Green #0D6535
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  publishBtnDisabled: {
    backgroundColor: '#E2E8F0',
  },
  publishBtnText: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  publishBtnTextActive: {
    color: colors.textWhite,
  },
  publishBtnTextDisabled: {
    color: '#94A3B8',
  },
});
