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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useHustleContext } from '../context/HustleContext';
import { CATEGORIES, KNUST_LOCATIONS } from '../data/mockData';
import { CategoryId, PriceType, DeliveryMode } from '../types';
import { formatGhanaPhoneNumber } from '../services/api';

interface PostHustleScreenProps {
  navigation: any;
}

export const PostHustleScreen: React.FC<PostHustleScreenProps> = ({ navigation }) => {
  const { addHustle, user, setAuthModalVisible } = useHustleContext();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryId>('tutoring');
  const [price, setPrice] = useState('');
  const [priceType, setPriceType] = useState<PriceType>('flat');
  const [hostelLocation, setHostelLocation] = useState('Ayeduase Central');
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('to_client');
  const [status, setStatus] = useState<'OPEN' | 'BUSY'>('OPEN');
  const [sellerName, setSellerName] = useState('');
  const [sellerProgram, setSellerProgram] = useState('');
  const [whatsAppNumber, setWhatsAppNumber] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [customImageUri, setCustomImageUri] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80'
  );

  const deliveryOptions: { id: DeliveryMode; label: string; icon: string; desc: string }[] = [
    { id: 'to_client', label: 'I visit your hostel', icon: '🏠', desc: 'Travel to client room/hostel' },
    { id: 'at_seller', label: 'Come to my hostel', icon: '📍', desc: 'Client visits my room/hostel' },
    { id: 'campus_spot', label: 'Meet on campus', icon: '🎓', desc: 'CCB, Library, Brunei Market' },
    { id: 'remote', label: 'Remote / Online', icon: '💻', desc: 'WhatsApp, Zoom, Email' },
  ];

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedUri = result.assets[0].uri;
        setCustomImageUri(pickedUri);
        setImageUrl(pickedUri);
      }
    } catch (err) {
      Alert.alert('Image Error', 'Unable to load photo from gallery.');
    }
  };

  useEffect(() => {
    if (user) {
      setSellerName(user.name);
      setSellerProgram(user.program);
      setWhatsAppNumber(user.whatsAppNumber);
      setHostelLocation(user.hostelLocation || 'Ayeduase Central');
    }
  }, [user]);

  const presetImages = [
    { label: '📚 Study', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80' },
    { label: '💻 Tech', url: 'https://images.unsplash.com/photo-1597740985671-2a8a3b80502e?auto=format&fit=crop&w=600&q=80' },
    { label: '📸 Camera', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80' },
    { label: '🍕 Food', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80' },
    { label: '💅 Beauty', url: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=600&q=80' },
  ];

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loggedOutContainer}>
          <Text style={styles.loggedOutIcon}>🎓</Text>
          <Text style={styles.loggedOutTitle}>KNUST Student Login Required</Text>
          <Text style={styles.loggedOutSub}>
            Please log in or register with your valid @st.knust.edu.gh student email to publish side-hustles on campus.
          </Text>

          <TouchableOpacity
            style={styles.loginNowBtn}
            onPress={() => setAuthModalVisible(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.loginNowText}>🔑 Student Log In / Sign Up</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for your side-hustle.');
      return;
    }
    if (!price.trim() || isNaN(Number(price))) {
      Alert.alert('Invalid Price', 'Please enter a valid price in GH₵.');
      return;
    }
    const sanitizedWhatsApp = formatGhanaPhoneNumber(whatsAppNumber.trim());
    if (!sanitizedWhatsApp || sanitizedWhatsApp.length < 10) {
      Alert.alert('Invalid Contact', 'Please enter a valid WhatsApp phone number (e.g. 0241234567).');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Missing Description', 'Please add a brief description of what you offer.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (tags.length === 0) {
      tags.push('KNUST', category);
    }

    addHustle({
      title,
      category,
      price: Number(price),
      priceType,
      hostelLocation,
      sellerId: user.id,
      sellerName,
      sellerProgram,
      campus: 'knust',
      whatsAppNumber: sanitizedWhatsApp,
      description,
      tags,
      imageUrl,
      deliveryMode,
      status,
    });

    Alert.alert('🎉 Success!', 'Your side-hustle is now live on CampusHustle KNUST!', [
      {
        text: 'View Marketplace',
        onPress: () => navigation.navigate('Home'),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#059669" />
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>Post a Side-Hustle</Text>
        <Text style={styles.headerSubtitle}>Publishing as {user.name} ({user.email})</Text>
      </View>

      <ScrollView contentContainerStyle={styles.formContent}>
        {/* Title */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Hustle Title *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Calculus Tutoring, Laptop Formatting, Knotless Braids"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Category Picker */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillContainer}>
            {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
              const isSelected = category === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.pill, isSelected && styles.selectedPill]}
                  onPress={() => setCategory(cat.id as CategoryId)}
                >
                  <Text style={styles.pillIcon}>{cat.icon}</Text>
                  <Text style={[styles.pillLabel, isSelected && styles.selectedPillLabel]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Service / Delivery Mode */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Service / Meeting Mode *</Text>
          <View style={styles.deliveryContainer}>
            {deliveryOptions.map((opt) => {
              const isSelected = deliveryMode === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.deliveryCard, isSelected && styles.selectedDeliveryCard]}
                  onPress={() => setDeliveryMode(opt.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.deliveryIcon}>{opt.icon}</Text>
                  <View style={styles.deliveryInfo}>
                    <Text style={[styles.deliveryTitle, isSelected && styles.selectedDeliveryText]}>
                      {opt.label}
                    </Text>
                    <Text style={[styles.deliveryDesc, isSelected && styles.selectedDeliverySub]}>
                      {opt.desc}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Availability Toggle */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Initial Availability Status *</Text>
          <View style={styles.statusToggleRow}>
            <TouchableOpacity
              style={[styles.statusOption, status === 'OPEN' && styles.statusOptionOpen]}
              onPress={() => setStatus('OPEN')}
              activeOpacity={0.8}
            >
              <Text style={styles.statusOptionDot}>●</Text>
              <Text style={[styles.statusOptionLabel, status === 'OPEN' && styles.statusOptionLabelOpen]}>
                Available for Orders
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statusOption, status === 'BUSY' && styles.statusOptionBusy]}
              onPress={() => setStatus('BUSY')}
              activeOpacity={0.8}
            >
              <Text style={styles.statusOptionDotBusy}>●</Text>
              <Text style={[styles.statusOptionLabel, status === 'BUSY' && styles.statusOptionLabelBusy]}>
                Busy with Lectures
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Price & Price Type */}
        <View style={styles.rowInputs}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Price (GH₵) *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 50"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1.2 }]}>
            <Text style={styles.label}>Price Type</Text>
            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[styles.typeBtn, priceType === 'flat' && styles.selectedTypeBtn]}
                onPress={() => setPriceType('flat')}
              >
                <Text style={[styles.typeText, priceType === 'flat' && styles.selectedTypeText]}>Flat</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, priceType === 'hourly' && styles.selectedTypeBtn]}
                onPress={() => setPriceType('hourly')}
              >
                <Text style={[styles.typeText, priceType === 'hourly' && styles.selectedTypeText]}>/Hr</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, priceType === 'starting_at' && styles.selectedTypeBtn]}
                onPress={() => setPriceType('starting_at')}
              >
                <Text style={[styles.typeText, priceType === 'starting_at' && styles.selectedTypeText]}>Start</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Hostel / Location */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Hostel / Base Location at KNUST *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillContainer}>
            {KNUST_LOCATIONS.filter((l) => l !== 'All Locations').map((loc) => {
              const isSelected = hostelLocation === loc;
              return (
                <TouchableOpacity
                  key={loc}
                  style={[styles.chip, isSelected && styles.selectedChip]}
                  onPress={() => setHostelLocation(loc)}
                >
                  <Text style={[styles.chipText, isSelected && styles.selectedChipText]}>📍 {loc}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Seller Info */}
        <View style={styles.rowInputs}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Seller Name</Text>
            <TextInput
              style={styles.textInput}
              value={sellerName}
              onChangeText={setSellerName}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>WhatsApp No. *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 0241234567"
              keyboardType="phone-pad"
              value={whatsAppNumber}
              onChangeText={setWhatsAppNumber}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Program & Level</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Computer Science (Level 300)"
            value={sellerProgram}
            onChangeText={setSellerProgram}
          />
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Detailed Description *</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Describe your service, what's included, how to request, meeting locations..."
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Portfolio Photo Upload */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Photo of Your Work / Products</Text>
          {customImageUri ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: customImageUri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removePhotoBtn}
                onPress={() => {
                  setCustomImageUri(null);
                  setImageUrl(presetImages[0].url);
                }}
              >
                <Text style={styles.removePhotoText}>✕ Remove Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadBtn} onPress={pickImage} activeOpacity={0.8}>
              <Text style={styles.uploadIcon}>📷</Text>
              <Text style={styles.uploadBtnText}>Upload Photo from Gallery / Device</Text>
              <Text style={styles.uploadSubtext}>Show off hair you braided, items you sell, or past work</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Or Preset Images */}
        <View style={styles.inputGroup}>
          <Text style={styles.subLabel}>Or select a quick stock preset:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillContainer}>
            {presetImages.map((preset) => (
              <TouchableOpacity
                key={preset.label}
                style={[styles.chip, imageUrl === preset.url && !customImageUri && styles.selectedChip]}
                onPress={() => {
                  setCustomImageUri(null);
                  setImageUrl(preset.url);
                }}
              >
                <Text style={[styles.chipText, imageUrl === preset.url && !customImageUri && styles.selectedChipText]}>
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tags */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Search Tags (Comma separated)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Exams, C++, Repairs, Quick"
            value={tagsInput}
            onChangeText={setTagsInput}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
          <Text style={styles.submitBtnText}>🚀 Publish Side-Hustle</Text>
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
  topHeader: {
    backgroundColor: '#059669',
    padding: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#D1FAE5',
    marginTop: 2,
  },
  formContent: {
    padding: 16,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  pillContainer: {
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  selectedPill: {
    backgroundColor: '#059669',
  },
  pillIcon: {
    fontSize: 13,
    marginRight: 4,
  },
  pillLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  selectedPillLabel: {
    color: '#FFFFFF',
  },
  typeContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    padding: 3,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedTypeBtn: {
    backgroundColor: '#059669',
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  selectedTypeText: {
    color: '#FFFFFF',
  },
  chip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  selectedChip: {
    backgroundColor: '#F59E0B',
    borderColor: '#D97706',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  selectedChipText: {
    color: '#FFFFFF',
  },
  submitBtn: {
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  deliveryContainer: {
    gap: 8,
  },
  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
  },
  selectedDeliveryCard: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
    borderWidth: 1.5,
  },
  deliveryIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  selectedDeliveryText: {
    color: '#059669',
    fontWeight: '800',
  },
  deliveryDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  selectedDeliverySub: {
    color: '#047857',
  },
  statusToggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statusOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  statusOptionOpen: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  statusOptionBusy: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
  },
  statusOptionDot: {
    fontSize: 10,
    color: '#10B981',
    marginRight: 6,
  },
  statusOptionDotBusy: {
    fontSize: 10,
    color: '#F59E0B',
    marginRight: 6,
  },
  statusOptionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  statusOptionLabelOpen: {
    color: '#065F46',
    fontWeight: '800',
  },
  statusOptionLabelBusy: {
    color: '#92400E',
    fontWeight: '800',
  },
  uploadBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  uploadBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
    marginBottom: 2,
  },
  uploadSubtext: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
  previewContainer: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  removePhotoText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  subLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 8,
  },
  loggedOutContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loggedOutIcon: {
    fontSize: 56,
    marginBottom: 12,
  },
  loggedOutTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  loggedOutSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  loginNowBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  loginNowText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
