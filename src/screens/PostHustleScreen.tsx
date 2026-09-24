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
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useHustleContext } from '../context/HustleContext';
import { CATEGORIES, CAMPUS_LOCATIONS, CAMPUS_METADATA } from '../data/mockData';
import { CategoryId, PriceType, DeliveryMode } from '../types';
import { formatGhanaPhoneNumber, uploadHustleImageApi } from '../services/api';
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

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  all: 'compass-outline',
  tutoring: 'book-outline',
  tech_repair: 'laptop-outline',
  food_delivery: 'restaurant-outline',
  photo_video: 'camera-outline',
  fashion_beauty: 'cut-outline',
  laundry_errands: 'cube-outline',
  custom: 'brush-outline',
};

export const PostHustleScreen: React.FC<PostHustleScreenProps> = ({ navigation }) => {
  const { addHustle, user, token, setAuthModalVisible, selectedCampus } = useHustleContext();

  const campusInfo = CAMPUS_METADATA[selectedCampus] || CAMPUS_METADATA.knust;
  const availableLocations = (CAMPUS_LOCATIONS[selectedCampus] || CAMPUS_LOCATIONS.knust).filter(
    (l) => l !== 'All Locations' && l !== 'All KNUST'
  );

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryId>('tutoring');
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('to_client');
  const [status, setStatus] = useState<'OPEN' | 'BUSY'>('OPEN');
  const [price, setPrice] = useState('');
  const [priceType, setPriceType] = useState<PriceType>('flat');
  const [hostelLocation, setHostelLocation] = useState(availableLocations[0] || 'Ayeduase');
  const [sellerName, setSellerName] = useState(user?.name || 'Emma Robert');
  const [whatsAppNumber, setWhatsAppNumber] = useState('');
  const [program, setProgram] = useState(user?.program?.split(' (')[0] || 'Computer Engineering');
  const [level, setLevel] = useState('Level 300');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [customImageUri, setCustomImageUri] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [levelModalOpen, setLevelModalOpen] = useState(false);

  useEffect(() => {
    if (user?.whatsAppNumber) {
      setWhatsAppNumber(user.whatsAppNumber.replace(/^233/, '0'));
    }
    if (user?.name) {
      setSellerName(user.name);
    }
    if (user?.hostelLocation) {
      setHostelLocation(user.hostelLocation);
    }
  }, [user]);

  const handlePickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showAlert('Permission Required', 'Please allow gallery access to upload photos of your work.');
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

  const deliveryModesList: {
    id: DeliveryMode;
    title: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
  }[] = [
    {
      id: 'to_client',
      title: 'I visit your hostel',
      subtitle: "You travel to client's location",
      icon: 'send-outline',
    },
    {
      id: 'at_seller',
      title: 'Come to my hostel',
      subtitle: "Client comes to your hostel/room",
      icon: 'home-outline',
    },
    {
      id: 'campus_spot',
      title: 'Meet on campus',
      subtitle: 'Library, Great Hall, lecture areas',
      icon: 'people-outline',
    },
    {
      id: 'remote',
      title: 'Remote / Online',
      subtitle: 'WhatsApp, Zoom, Email delivery',
      icon: 'wifi-outline',
    },
  ];

  const levelsList = ['Level 100', 'Level 200', 'Level 300', 'Level 400', 'Postgraduate'];

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

    if (!whatsAppNumber.trim() || whatsAppNumber.replace(/\D/g, '').length < 9) {
      setErrorMessage('Please enter a valid Ghana WhatsApp number (e.g. 0241234567).');
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedWhatsApp = formatGhanaPhoneNumber(whatsAppNumber);
      let finalImageUrl =
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80';

      if (customImageUri) {
        if (!token) {
          setAuthModalVisible(true);
          setIsSubmitting(false);
          return;
        }
        const uploadRes = await uploadHustleImageApi(customImageUri, token);
        if (!uploadRes?.imageUrl) {
          throw new Error('Could not upload your photo. Please try another image.');
        }
        finalImageUrl = uploadRes.imageUrl;
      }

      const tagArray = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await addHustle({
        title: title.trim(),
        description: description.trim() || 'Professional campus service provided by ' + sellerName,
        price: numPrice,
        priceType,
        category,
        sellerId: user.id,
        sellerName: sellerName.trim(),
        sellerProgram: `${program.trim()} (${level})`,
        campus: selectedCampus,
        hostelLocation,
        whatsAppNumber: formattedWhatsApp,
        imageUrl: finalImageUrl,
        tags: tagArray.length > 0 ? tagArray : ['Campus', 'Student', category],
        deliveryMode,
        status,
      });

      showAlert('Service Published', 'Your service is now live on CampusHustle.', () => {
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

      {/* Header matching screenshots */}
      <View style={styles.headerBar}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Post a Service</Text>

          <TouchableOpacity
            style={styles.saveDraftBtn}
            onPress={() => showAlert('Draft Saved', 'Your service draft has been saved locally.')}
            activeOpacity={0.8}
          >
            <Text style={styles.saveDraftText}>Save Draft</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.headerSubtitle}>
          Publishing as {sellerName} · {program}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {errorMessage && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color="#DC2626" style={{ marginRight: 6 }} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* 01 — SERVICE INFO */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>01 — SERVICE INFO</Text>

          <Text style={styles.fieldLabel}>
            Service Title <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Calculus Tutoring, Laptop Formatting, k..."
            placeholderTextColor="#94A3B8"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>
            Category <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
              const isSelected = category === cat.id;
              const iconName = CATEGORY_ICONS[cat.id] || 'apps-outline';
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryPill, isSelected && styles.categoryPillSelected]}
                  onPress={() => setCategory(cat.id)}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name={iconName}
                    size={16}
                    color={isSelected ? colors.primary : '#475569'}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelSelected]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 02 — HOW YOU DELIVER */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>02 — HOW YOU DELIVER</Text>
          <Text style={styles.fieldLabel}>
            Service / Meeting Mode <Text style={styles.requiredStar}>*</Text>
          </Text>

          <View style={styles.deliveryCardsStack}>
            {deliveryModesList.map((mode) => {
              const isSelected = deliveryMode === mode.id;
              return (
                <TouchableOpacity
                  key={mode.id}
                  style={[styles.deliveryCard, isSelected && styles.deliveryCardSelected]}
                  onPress={() => setDeliveryMode(mode.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.deliveryIconBox, isSelected && styles.deliveryIconBoxSelected]}>
                    <Ionicons
                      name={mode.icon}
                      size={20}
                      color={isSelected ? '#FFFFFF' : '#475569'}
                    />
                  </View>

                  <View style={styles.deliveryTextCluster}>
                    <Text style={[styles.deliveryTitle, isSelected && styles.deliveryTitleSelected]}>
                      {mode.title}
                    </Text>
                    <Text style={styles.deliverySubtitle}>{mode.subtitle}</Text>
                  </View>

                  <View style={styles.radioBox}>
                    {isSelected ? (
                      <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                    ) : (
                      <Ionicons name="ellipse-outline" size={22} color="#CBD5E1" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 03 — AVAILABILITY & PRICING */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>03 — AVAILABILITY & PRICING</Text>

          <Text style={styles.fieldLabel}>Initial Availability Status</Text>
          <View style={styles.statusToggleRow}>
            <TouchableOpacity
              style={[styles.statusToggleCard, status === 'OPEN' && styles.statusToggleCardActive]}
              onPress={() => setStatus('OPEN')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="toggle"
                size={20}
                color={status === 'OPEN' ? colors.primary : '#94A3B8'}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles.statusToggleText,
                  status === 'OPEN' && styles.statusToggleTextActive,
                ]}
              >
                Available for Orders
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statusToggleCard, status === 'BUSY' && styles.statusToggleCardBusy]}
              onPress={() => setStatus('BUSY')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="toggle-outline"
                size={20}
                color={status === 'BUSY' ? '#D97706' : '#94A3B8'}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles.statusToggleText,
                  status === 'BUSY' && styles.statusToggleTextBusy,
                ]}
              >
                Busy with Semester
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>
            Price (GHS) <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View style={styles.priceRow}>
            <View style={styles.priceInputBox}>
              <Text style={styles.priceSymbol}>₵</Text>
              <TextInput
                style={styles.priceTextInput}
                placeholder="0.00"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </View>

            <View style={styles.priceTypeSelector}>
              {(['flat', 'per_job', 'starting_at'] as const).map((type) => {
                const label = type === 'flat' ? 'Flat fee' : type === 'per_job' ? 'Per job' : 'Starting at';
                const mappedType: PriceType = type === 'per_job' ? 'hourly' : type;
                const isSelected = priceType === mappedType;

                return (
                  <TouchableOpacity
                    key={type}
                    style={[styles.priceTypePill, isSelected && styles.priceTypePillActive]}
                    onPress={() => setPriceType(mappedType)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.priceTypeLabel,
                        isSelected && styles.priceTypeLabelActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* 04 — LOCATION & PROFILE */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>04 — LOCATION & PROFILE</Text>

          <Text style={styles.fieldLabel}>
            Your Hostel / Base Location <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.dropdownSelector}
            onPress={() => setLocationModalOpen(!locationModalOpen)}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="location-outline" size={17} color="#94A3B8" style={{ marginRight: 8 }} />
              <Text style={styles.dropdownSelectorText}>{hostelLocation}</Text>
            </View>
            <Ionicons
              name={locationModalOpen ? 'chevron-up-outline' : 'chevron-down-outline'}
              size={18}
              color="#94A3B8"
            />
          </TouchableOpacity>

          {locationModalOpen && (
            <View style={styles.dropdownListContainer}>
              {availableLocations.map((loc) => (
                <TouchableOpacity
                  key={loc}
                  style={styles.dropdownListItem}
                  onPress={() => {
                    setHostelLocation(loc);
                    setLocationModalOpen(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, hostelLocation === loc && { color: colors.primary, fontWeight: '700' }]}>
                    {loc}
                  </Text>
                  {hostelLocation === loc && (
                    <Ionicons name="checkmark" size={16} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Your Name</Text>
          <TextInput
            style={styles.textInput}
            value={sellerName}
            onChangeText={setSellerName}
            placeholder="Emma Robert"
            placeholderTextColor="#94A3B8"
          />

          <Text style={[styles.fieldLabel, { marginTop: 14 }]}>
            WhatsApp Number <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View style={styles.phoneInputRow}>
            <View style={styles.countryCodeBadge}>
              <Text style={styles.countryCodeText}>+233</Text>
            </View>
            <TextInput
              style={styles.phoneTextInput}
              placeholder="e.g. 0241234567"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              value={whatsAppNumber}
              onChangeText={setWhatsAppNumber}
            />
          </View>

          <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Program & Level</Text>
          <View style={styles.programLevelRow}>
            <TextInput
              style={[styles.textInput, { flex: 2, marginRight: 8 }]}
              placeholder="e.g. Computer Engineering"
              placeholderTextColor="#94A3B8"
              value={program}
              onChangeText={setProgram}
            />
            <TouchableOpacity
              style={[styles.dropdownSelector, { flex: 1.2 }]}
              onPress={() => setLevelModalOpen(!levelModalOpen)}
              activeOpacity={0.8}
            >
              <Text style={styles.dropdownSelectorText} numberOfLines={1}>{level}</Text>
              <Ionicons name="chevron-down-outline" size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {levelModalOpen && (
            <View style={styles.dropdownListContainer}>
              {levelsList.map((lvl) => (
                <TouchableOpacity
                  key={lvl}
                  style={styles.dropdownListItem}
                  onPress={() => {
                    setLevel(lvl);
                    setLevelModalOpen(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, level === lvl && { color: colors.primary, fontWeight: '700' }]}>
                    {lvl}
                  </Text>
                  {level === lvl && (
                    <Ionicons name="checkmark" size={16} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 05 — DESCRIPTION & MEDIA */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeader}>05 — DESCRIPTION & MEDIA</Text>
          </View>

          <View style={styles.descriptionLabelRow}>
            <Text style={styles.fieldLabel}>
              Detailed Description <Text style={styles.requiredStar}>*</Text>
            </Text>
            <Text style={styles.charCounter}>{description.length} / 500</Text>
          </View>

          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={5}
            maxLength={500}
            placeholder="Describe your service — what's included, your experience, how to reach you, meeting locations..."
            placeholderTextColor="#94A3B8"
            value={description}
            onChangeText={setDescription}
          />

          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Photos of Your Work</Text>
          <TouchableOpacity
            style={styles.uploadBox}
            onPress={handlePickImage}
            activeOpacity={0.8}
          >
            {customImageUri ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: customImageUri }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => setCustomImageUri(null)}
                >
                  <Ionicons name="close-circle" size={20} color="#DC2626" />
                  <Text style={styles.removeImageText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <View style={styles.uploadIconBox}>
                  <Ionicons name="cloud-upload-outline" size={24} color={colors.primary} />
                </View>
                <Text style={styles.uploadTitle}>Upload from Gallery or Camera</Text>
                <Text style={styles.uploadSubtitle}>
                  Photos help buyers trust your work. Up to 5 images.
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Search Tags</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Exams, C++, Repairs, Quick — separate"
            placeholderTextColor="#94A3B8"
            value={tags}
            onChangeText={setTags}
          />
          <Text style={styles.helperText}>Tags help students find your service in search.</Text>
        </View>

        {/* Publish Action Button */}
        <TouchableOpacity
          style={[styles.publishBtn, (!isFormValid || isSubmitting) && styles.publishBtnDisabled]}
          onPress={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          activeOpacity={0.88}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={[styles.publishBtnText, (!isFormValid || isSubmitting) && styles.publishBtnTextDisabled]}>
              Publish Service
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBar: {
    backgroundColor: colors.primary, // Vibrant Emerald Green
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  saveDraftBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  saveDraftText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    textAlign: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...shadows.card,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  requiredStar: {
    color: '#EF4444',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  categoryPillSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F0FDF4',
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  categoryLabelSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  deliveryCardsStack: {
    gap: 10,
    marginTop: 4,
  },
  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  deliveryCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F0FDF4',
  },
  deliveryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deliveryIconBoxSelected: {
    backgroundColor: colors.primary,
  },
  deliveryTextCluster: {
    flex: 1,
  },
  deliveryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  deliveryTitleSelected: {
    color: colors.primary,
  },
  deliverySubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  radioBox: {
    marginLeft: 8,
  },
  statusToggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statusToggleCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  statusToggleCardActive: {
    backgroundColor: '#F0FDF4',
    borderColor: colors.primary,
  },
  statusToggleCardBusy: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  statusToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    flex: 1,
  },
  statusToggleTextActive: {
    color: colors.primary,
  },
  statusToggleTextBusy: {
    color: '#92400E',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  priceInputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
  },
  priceSymbol: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
    marginRight: 6,
  },
  priceTextInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  priceTypeSelector: {
    flex: 1.6,
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
  },
  priceTypePill: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  priceTypePillActive: {
    backgroundColor: colors.primary,
  },
  priceTypeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  priceTypeLabelActive: {
    color: '#FFFFFF',
  },
  dropdownSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownSelectorText: {
    fontSize: 13.5,
    color: '#1E293B',
    fontWeight: '600',
  },
  dropdownListContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginTop: 6,
    maxHeight: 180,
    overflow: 'hidden',
  },
  dropdownListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemText: {
    fontSize: 13,
    color: '#334155',
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodeBadge: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginRight: 8,
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  phoneTextInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  programLevelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  descriptionLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCounter: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  textArea: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    fontSize: 13.5,
    color: '#0F172A',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  uploadBox: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  uploadTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    width: '100%',
  },
  imagePreview: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    marginBottom: 8,
  },
  removeImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  removeImageText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '700',
  },
  helperText: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 4,
  },
  publishBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...shadows.card,
  },
  publishBtnDisabled: {
    backgroundColor: '#E2E8F0',
  },
  publishBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  publishBtnTextDisabled: {
    color: '#94A3B8',
  },
});
