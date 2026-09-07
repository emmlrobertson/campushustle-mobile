import React, { useState } from 'react';
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
} from 'react-native';
import { useHustleContext } from '../context/HustleContext';
import { CATEGORIES, KNUST_LOCATIONS, CURRENT_USER } from '../data/mockData';
import { CategoryId, PriceType } from '../types';

interface PostHustleScreenProps {
  navigation: any;
}

export const PostHustleScreen: React.FC<PostHustleScreenProps> = ({ navigation }) => {
  const { addHustle } = useHustleContext();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryId>('tutoring');
  const [price, setPrice] = useState('');
  const [priceType, setPriceType] = useState<PriceType>('flat');
  const [hostelLocation, setHostelLocation] = useState('Ayeduase');
  const [sellerName, setSellerName] = useState(CURRENT_USER.name);
  const [sellerProgram, setSellerProgram] = useState(CURRENT_USER.program);
  const [whatsAppNumber, setWhatsAppNumber] = useState(CURRENT_USER.whatsAppNumber);
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80'
  );

  const presetImages = [
    { label: '📚 Study', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80' },
    { label: '💻 Tech', url: 'https://images.unsplash.com/photo-1597740985671-2a8a3b80502e?auto=format&fit=crop&w=600&q=80' },
    { label: '📸 Camera', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80' },
    { label: '🍕 Food', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80' },
    { label: '💅 Beauty', url: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=600&q=80' },
  ];

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for your side-hustle.');
      return;
    }
    if (!price.trim() || isNaN(Number(price))) {
      Alert.alert('Invalid Price', 'Please enter a valid price in GH₵.');
      return;
    }
    if (!whatsAppNumber.trim()) {
      Alert.alert('Missing Contact', 'Please enter your WhatsApp contact number.');
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
      sellerName,
      sellerProgram,
      campus: 'knust',
      whatsAppNumber,
      description,
      tags,
      imageUrl,
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
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>Post a Side-Hustle</Text>
        <Text style={styles.headerSubtitle}>Publish your service to KNUST students</Text>
      </View>

      <ScrollView contentContainerStyle={styles.formContent}>
        {/* Title */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Hustle Title *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Calculus Tutoring, Laptop Formatting, Hair Braiding"
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
          <Text style={styles.label}>Hostel / Location at KNUST *</Text>
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
            <Text style={styles.label}>Your Name</Text>
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
              placeholder="e.g. 233551234567"
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

        {/* Banner Image Preset */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Cover Image Preset</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillContainer}>
            {presetImages.map((preset) => (
              <TouchableOpacity
                key={preset.label}
                style={[styles.chip, imageUrl === preset.url && styles.selectedChip]}
                onPress={() => setImageUrl(preset.url)}
              >
                <Text style={[styles.chipText, imageUrl === preset.url && styles.selectedChipText]}>
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
    backgroundColor: '#1E3A8A',
    padding: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#93C5FD',
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
    backgroundColor: '#1E3A8A',
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
    backgroundColor: '#1E3A8A',
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
    backgroundColor: '#1E3A8A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
