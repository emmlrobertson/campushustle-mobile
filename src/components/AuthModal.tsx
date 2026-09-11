import React, { useState, useEffect } from 'react';
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
  Platform,
} from 'react-native';
import { CAMPUS_LOCATIONS, CAMPUS_METADATA } from '../data/mockData';
import { registerStudentApi, loginStudentApi, formatGhanaPhoneNumber } from '../services/api';
import { StudentProfile } from '../types';
import { useHustleContext } from '../context/HustleContext';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (user: StudentProfile, token: string) => void;
}

const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.alert) {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export const AuthModal: React.FC<AuthModalProps> = ({ visible, onClose, onSuccess }) => {
  const { selectedCampus } = useHustleContext();
  const campusInfo = CAMPUS_METADATA[selectedCampus] || CAMPUS_METADATA.knust;
  const availableLocations = (CAMPUS_LOCATIONS[selectedCampus] || CAMPUS_LOCATIONS.knust).filter(
    (l) => l !== 'All Locations'
  );

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [program, setProgram] = useState('');
  const [hostelLocation, setHostelLocation] = useState(availableLocations[0] || 'Campus Hostel');
  const [whatsAppNumber, setWhatsAppNumber] = useState('');

  // Update hostel location default when campus changes
  useEffect(() => {
    if (availableLocations.length > 0) {
      setHostelLocation(availableLocations[0]);
    }
  }, [selectedCampus]);

  const fillDemoData = () => {
    const demoNames = {
      knust: 'Kwame Mensah',
      ug_legon: 'Ama Osei',
      ucc: 'Kojo Mills',
    };
    const demoPrograms = {
      knust: 'BSc. Computer Engineering (Level 300)',
      ug_legon: 'BSc. Administration (Level 300)',
      ucc: 'BEd. Science Education (Level 300)',
    };

    setName(demoNames[selectedCampus] || 'Student Hustler');
    setEmail(`student_${Math.floor(Math.random() * 900 + 100)}@${campusInfo.emailDomain}`);
    setPassword('campus2026');
    setProgram(demoPrograms[selectedCampus] || 'Undergraduate (Level 300)');
    setHostelLocation(availableLocations[0] || 'Campus Hostel');
    setWhatsAppNumber('0241234567');
    setErrorMessage(null);
  };

  const handleLogin = async () => {
    setErrorMessage(null);
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password.trim()) {
      setErrorMessage('Please enter your student email and password.');
      return;
    }

    // Cross-campus verification
    const expectedDomain = `@${campusInfo.emailDomain}`;
    if (!cleanEmail.endsWith(expectedDomain)) {
      let matchedOtherCampus: string | null = null;
      if (cleanEmail.endsWith('@st.knust.edu.gh')) matchedOtherCampus = 'KNUST';
      else if (cleanEmail.endsWith('@st.ug.edu.gh')) matchedOtherCampus = 'UG Legon';
      else if (cleanEmail.endsWith('@stu.ucc.edu.gh')) matchedOtherCampus = 'UCC';

      if (matchedOtherCampus) {
        setErrorMessage(
          `This account belongs to ${matchedOtherCampus}. You are currently in the ${campusInfo.shortName} view. Please switch to ${matchedOtherCampus} from the top header to log in.`
        );
        return;
      }
    }

    setIsLoading(true);
    try {
      const res = await loginStudentApi({ email: cleanEmail, password });
      setIsLoading(false);
      showAlert('🎉 Welcome Back!', `Logged in as ${res.user.name} (${campusInfo.shortName})`);
      onSuccess(res.user, res.token);
      onClose();
    } catch (error: any) {
      setIsLoading(false);
      const msg = error?.message || 'Invalid email or password.';
      setErrorMessage(msg);
      showAlert('Login Notice', msg);
    }
  };

  const handleRegister = async () => {
    setErrorMessage(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedProgram = program.trim();
    const trimmedPhone = whatsAppNumber.trim();

    if (!trimmedName || !trimmedEmail || !password || !trimmedProgram || !trimmedPhone) {
      setErrorMessage('Please fill in all required fields (*).');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    // Strict Campus Domain Enforcement
    const expectedDomain = `@${campusInfo.emailDomain}`;
    if (!trimmedEmail.endsWith(expectedDomain)) {
      let matchedOtherCampus: string | null = null;
      if (trimmedEmail.endsWith('@st.knust.edu.gh')) matchedOtherCampus = 'KNUST';
      else if (trimmedEmail.endsWith('@st.ug.edu.gh')) matchedOtherCampus = 'UG Legon';
      else if (trimmedEmail.endsWith('@stu.ucc.edu.gh')) matchedOtherCampus = 'UCC';

      if (matchedOtherCampus) {
        setErrorMessage(
          `This email belongs to ${matchedOtherCampus}. You are currently in the ${campusInfo.shortName} view. Please switch to ${matchedOtherCampus} from the top header to register.`
        );
      } else {
        setErrorMessage(
          `Valid ${campusInfo.shortName} student email required (must end with ${expectedDomain}). Tap "Quick Demo Fill" to auto-fill an account.`
        );
      }
      return;
    }

    const sanitizedWhatsApp = formatGhanaPhoneNumber(trimmedPhone);
    if (!sanitizedWhatsApp || sanitizedWhatsApp.length < 9) {
      setErrorMessage('Please enter a valid Ghana phone number (e.g. 0241234567).');
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerStudentApi({
        name: trimmedName,
        email: trimmedEmail,
        password,
        program: trimmedProgram,
        hostelLocation,
        whatsAppNumber: sanitizedWhatsApp,
        campus: selectedCampus,
      });

      setIsLoading(false);
      showAlert('🎓 Account Created!', `Welcome to CampusHustle ${campusInfo.shortName}, ${res.user.name}!`);
      onSuccess(res.user, res.token);
      onClose();
    } catch (error: any) {
      setIsLoading(false);
      const msg = error?.message || 'Unable to register account. Please try again.';
      setErrorMessage(msg);
      showAlert('Registration Notice', msg);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header Bar */}
          <View style={styles.header}>
            <Text style={styles.title}>
              Campus<Text style={styles.greenText}>Hustle</Text> {campusInfo.shortName}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Mode Switcher Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, mode === 'login' && styles.activeTab]}
              onPress={() => {
                setMode('login');
                setErrorMessage(null);
              }}
            >
              <Text style={[styles.tabText, mode === 'login' && styles.activeTabText]}>
                Log In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, mode === 'register' && styles.activeTab]}
              onPress={() => {
                setMode('register');
                setErrorMessage(null);
              }}
            >
              <Text style={[styles.tabText, mode === 'register' && styles.activeTabText]}>
                Student Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {/* Inline Error Notice Banner */}
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>⚠️ {errorMessage}</Text>
            </View>
          ) : null}

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {mode === 'login' ? (
              <View>
                <Text style={styles.subtext}>
                  Log in with your {campusInfo.shortName} student email (@{campusInfo.emailDomain}) to post hustles & manage your listings.
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{campusInfo.shortName} Student Email *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={`e.g. student@${campusInfo.emailDomain}`}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={(val) => {
                      setEmail(val);
                      setErrorMessage(null);
                    }}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    secureTextEntry
                    value={password}
                    onChangeText={(val) => {
                      setPassword(val);
                      setErrorMessage(null);
                    }}
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
                    <Text style={styles.submitBtnText}>🔑 Log In to {campusInfo.shortName}</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.demoFillBtn}
                  onPress={() => {
                    setEmail(`student@${campusInfo.emailDomain}`);
                    setPassword('campus2026');
                    setErrorMessage(null);
                  }}
                >
                  <Text style={styles.demoFillBtnText}>💡 Demo Fill {campusInfo.shortName} Credentials</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View style={styles.registerSubHeader}>
                  <Text style={styles.subtext}>
                    Create your seller profile with your valid @{campusInfo.emailDomain} email.
                  </Text>
                  <TouchableOpacity style={styles.quickFillTag} onPress={fillDemoData}>
                    <Text style={styles.quickFillTagText}>⚡ Quick Demo Fill</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Kwame Mensah"
                    value={name}
                    onChangeText={(val) => {
                      setName(val);
                      setErrorMessage(null);
                    }}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{campusInfo.shortName} Student Email *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={`yourname@${campusInfo.emailDomain}`}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={(val) => {
                      setEmail(val);
                      setErrorMessage(null);
                    }}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password (min 6 chars) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Create a password"
                    secureTextEntry
                    value={password}
                    onChangeText={(val) => {
                      setPassword(val);
                      setErrorMessage(null);
                    }}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Program & Level *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Administration / Engineering (Level 300)"
                    value={program}
                    onChangeText={(val) => {
                      setProgram(val);
                      setErrorMessage(null);
                    }}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{campusInfo.shortName} Hostel / Area *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                    {availableLocations.map((loc) => (
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
                    placeholder="e.g. 0241234567 or 233551234567"
                    keyboardType="phone-pad"
                    value={whatsAppNumber}
                    onChangeText={(val) => {
                      setWhatsAppNumber(val);
                      setErrorMessage(null);
                    }}
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
                    <Text style={styles.submitBtnText}>🎓 Register {campusInfo.shortName} Account</Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
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
    padding: 6,
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
    marginBottom: 12,
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
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  errorBannerText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  registerSubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickFillTag: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  quickFillTagText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
  },
  subtext: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    flex: 1,
    paddingRight: 8,
  },
  formScroll: {
    maxHeight: 440,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 5,
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
  demoFillBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  demoFillBtnText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '700',
  },
});
