import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { KNUST_LOCATIONS } from '../data/mockData';
import { registerStudentApi, loginStudentApi } from '../services/api';
import { StudentProfile } from '../types';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (user: StudentProfile, token: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ visible, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [program, setProgram] = useState('');
  const [hostelLocation, setHostelLocation] = useState('Ayeduase');
  const [whatsAppNumber, setWhatsAppNumber] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter your student email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginStudentApi({ email: email.trim(), password });
      setIsLoading(false);
      Alert.alert('🎉 Welcome Back!', `Logged in as ${res.user.name}`);
      onSuccess(res.user, res.token);
      onClose();
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert('Login Error', error.message || 'Invalid email or password.');
    }
  };

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password || !program || !whatsAppNumber) {
      Alert.alert('Missing Fields', 'Please fill in all required registration fields.');
      return;
    }

    if (!email.trim().toLowerCase().endsWith('@st.knust.edu.gh')) {
      Alert.alert(
        'Student Email Required',
        'Registration is restricted strictly to valid KNUST student emails ending in @st.knust.edu.gh.'
      );
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerStudentApi({
        name: name.trim(),
        email: email.trim(),
        password,
        program: program.trim(),
        hostelLocation,
        whatsAppNumber: whatsAppNumber.trim(),
        campus: 'knust',
      });

      setIsLoading(false);
      Alert.alert('🎓 Account Created!', 'Your KNUST student account is live!');
      onSuccess(res.user, res.token);
      onClose();
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert('Registration Error', error.message || 'Unable to register account.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header Bar */}
          <View style={styles.header}>
            <Text style={styles.title}>
              Campus<Text style={styles.greenText}>Hustle</Text> KNUST
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Mode Switcher Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, mode === 'login' && styles.activeTab]}
              onPress={() => setMode('login')}
            >
              <Text style={[styles.tabText, mode === 'login' && styles.activeTabText]}>
                Log In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, mode === 'register' && styles.activeTab]}
              onPress={() => setMode('register')}
            >
              <Text style={[styles.tabText, mode === 'register' && styles.activeTabText]}>
                Student Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {mode === 'login' ? (
              <View>
                <Text style={styles.subtext}>
                  Log in with your KNUST student email to post hustles & manage your listings.
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>KNUST Student Email *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. kmensah@st.knust.edu.gh"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitBtnText}>🔑 Log In</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={styles.subtext}>
                  Create your seller profile using your valid @st.knust.edu.gh student email.
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Kwame Mensah"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>KNUST Student Email *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="yourname@st.knust.edu.gh"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Create a strong password"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Program & Level *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Computer Engineering (Level 300)"
                    value={program}
                    onChangeText={setProgram}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Hostel / Location *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                    {KNUST_LOCATIONS.filter((l) => l !== 'All Locations').map((loc) => (
                      <TouchableOpacity
                        key={loc}
                        style={[styles.chip, hostelLocation === loc && styles.selectedChip]}
                        onPress={() => setHostelLocation(loc)}
                      >
                        <Text style={[styles.chipText, hostelLocation === loc && styles.selectedChipText]}>
                          📍 {loc}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>WhatsApp Number *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 233551234567"
                    keyboardType="phone-pad"
                    value={whatsAppNumber}
                    onChangeText={setWhatsAppNumber}
                  />
                </View>

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleRegister}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitBtnText}>🎓 Register Account</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxHeight: '85%',
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  greenText: {
    color: '#059669',
  },
  closeBtn: {
    padding: 4,
  },
  closeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#64748B',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#059669',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  subtext: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 18,
  },
  formScroll: {
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#FAFAFA',
  },
  chipScroll: {
    flexDirection: 'row',
  },
  chip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
  },
  selectedChip: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  chipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  selectedChipText: {
    color: '#FFFFFF',
  },
  submitBtn: {
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
