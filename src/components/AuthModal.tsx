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
import {
  registerStudentApi,
  loginStudentApi,
  sendSmsOtpApi,
  verifySmsOtpApi,
  formatGhanaPhoneNumber,
} from '../services/api';
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
  const [loginMethod, setLoginMethod] = useState<'password' | 'sms_otp'>('password');
  const [step, setStep] = useState<'form' | 'otp_verify'>('form');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [program, setProgram] = useState('');
  const [hostelLocation, setHostelLocation] = useState(availableLocations[0] || 'Campus Hostel');
  const [whatsAppNumber, setWhatsAppNumber] = useState('');

  // OTP Verification States
  const [otpCode, setOtpCode] = useState('');
  const [otpTargetPhone, setOtpTargetPhone] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);

  // Countdown timer for resending OTP
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

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

  // Standard Password Login
  const handlePasswordLogin = async () => {
    setErrorMessage(null);
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password.trim()) {
      setErrorMessage('Please enter your student email and password.');
      return;
    }

    // Cross-campus verification check
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

  // Start SMS OTP Login
  const handleStartLoginOtp = async () => {
    setErrorMessage(null);
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = whatsAppNumber.trim();

    if (!cleanEmail && !cleanPhone) {
      setErrorMessage('Please enter your student email or registered phone number.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendSmsOtpApi({
        email: cleanEmail,
        whatsAppNumber: cleanPhone,
        purpose: 'login',
        campus: selectedCampus,
      });

      setIsLoading(false);
      setOtpTargetPhone(res.phone || cleanPhone || 'your phone');
      setDevOtp(res.devOtp || null);
      setStep('otp_verify');
      setCountdown(60);
      setOtpCode('');
      showAlert('📱 Security Code Dispatched', res.message || 'Enter the 6-digit code received via SMS.');
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Unable to send SMS code. Please try again.');
    }
  };

  // Start Registration with SMS OTP Verification
  const handleStartRegisterOtp = async () => {
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
      const res = await sendSmsOtpApi({
        email: trimmedEmail,
        whatsAppNumber: sanitizedWhatsApp,
        purpose: 'register',
        campus: selectedCampus,
      });

      setIsLoading(false);
      setOtpTargetPhone(res.phone || sanitizedWhatsApp);
      setDevOtp(res.devOtp || null);
      setStep('otp_verify');
      setCountdown(60);
      setOtpCode('');
      showAlert('📱 Security Code Dispatched', `A 6-digit verification code was sent via SMS to ${res.phone || sanitizedWhatsApp}`);
    } catch (error: any) {
      setIsLoading(false);
      const msg = error?.message || 'Unable to dispatch verification SMS.';
      setErrorMessage(msg);
      showAlert('Notice', msg);
    }
  };

  // Submit and verify OTP
  const handleVerifyOtpSubmit = async () => {
    setErrorMessage(null);
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setErrorMessage('Please enter the full 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifySmsOtpApi({
        email: email.trim().toLowerCase(),
        phone: otpTargetPhone,
        otp: otpCode.trim(),
        purpose: mode,
        name: name.trim(),
        password,
        program: program.trim(),
        hostelLocation,
        campus: selectedCampus,
      });

      setIsLoading(false);
      showAlert('🎉 Phone Verified!', `Welcome to CampusHustle ${campusInfo.shortName}, ${res.user.name}!`);
      onSuccess(res.user, res.token);
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Invalid or expired SMS code. Please try again.');
    }
  };

  const resendSmsOtp = async () => {
    if (countdown > 0) return;
    setIsLoading(true);
    try {
      const res = await sendSmsOtpApi({
        email: email.trim().toLowerCase(),
        whatsAppNumber: otpTargetPhone || whatsAppNumber.trim(),
        purpose: mode,
        campus: selectedCampus,
      });
      setIsLoading(false);
      setCountdown(60);
      setDevOtp(res.devOtp || null);
      showAlert('📱 New SMS Dispatched', 'A fresh 6-digit verification code was sent to your phone.');
    } catch (err: any) {
      setIsLoading(false);
      showAlert('Error', err.message || 'Could not resend SMS.');
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

          {/* Mode Switcher Tabs (Only visible when on form step) */}
          {step === 'form' && (
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
          )}

          {/* Inline Error Notice Banner */}
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>⚠️ {errorMessage}</Text>
            </View>
          ) : null}

          {/* STEP 2: 6-DIGIT SMS OTP VERIFICATION SCREEN */}
          {step === 'otp_verify' ? (
            <View style={styles.otpContainer}>
              <View style={styles.otpIconBadge}>
                <Text style={styles.otpIcon}>📱</Text>
              </View>

              <Text style={styles.otpTitle}>Enter SMS Verification Code</Text>
              <Text style={styles.otpSubtitle}>
                We sent a 6-digit code via SMS to:
              </Text>
              <View style={styles.phoneBadge}>
                <Text style={styles.phoneBadgeText}>{otpTargetPhone || whatsAppNumber}</Text>
              </View>

              {/* 6-Digit Code Input */}
              <View style={styles.otpInputGroup}>
                <TextInput
                  style={styles.otpTextInput}
                  placeholder="• • • • • •"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otpCode}
                  onChangeText={(val) => {
                    setOtpCode(val);
                    setErrorMessage(null);
                  }}
                  autoFocus
                />
              </View>

              {/* Developer One-Tap Auto Fill */}
              {devOtp && (
                <TouchableOpacity
                  style={styles.devOtpBtn}
                  onPress={() => {
                    setOtpCode(devOtp);
                    setErrorMessage(null);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.devOtpText}>⚡ One-Tap Demo Fill ({devOtp})</Text>
                </TouchableOpacity>
              )}

              {/* Verify Button */}
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleVerifyOtpSubmit}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {mode === 'register' ? '✅ Verify Phone & Register' : '🔓 Verify Phone & Log In'}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Resend Timer Row */}
              <View style={styles.resendRow}>
                {countdown > 0 ? (
                  <Text style={styles.resendTimerText}>Resend SMS in {countdown}s</Text>
                ) : (
                  <TouchableOpacity onPress={resendSmsOtp}>
                    <Text style={styles.resendActionText}>🔄 Resend SMS Code</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Back to Edit Button */}
              <TouchableOpacity
                style={styles.backLink}
                onPress={() => {
                  setStep('form');
                  setErrorMessage(null);
                }}
              >
                <Text style={styles.backLinkText}>← Back to Edit Details</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* STEP 1: LOGIN OR REGISTRATION FORM */
            <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
              {mode === 'login' ? (
                <View>
                  {/* Login Method Toggle: Password vs SMS OTP */}
                  <View style={styles.loginMethodRow}>
                    <TouchableOpacity
                      style={[styles.methodOption, loginMethod === 'password' && styles.methodOptionActive]}
                      onPress={() => {
                        setLoginMethod('password');
                        setErrorMessage(null);
                      }}
                    >
                      <Text
                        style={[
                          styles.methodOptionText,
                          loginMethod === 'password' && styles.methodOptionTextActive,
                        ]}
                      >
                        🔑 Password Login
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.methodOption, loginMethod === 'sms_otp' && styles.methodOptionActive]}
                      onPress={() => {
                        setLoginMethod('sms_otp');
                        setErrorMessage(null);
                      }}
                    >
                      <Text
                        style={[
                          styles.methodOptionText,
                          loginMethod === 'sms_otp' && styles.methodOptionTextActive,
                        ]}
                      >
                        📱 SMS OTP Login
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.subtext}>
                    {loginMethod === 'password'
                      ? `Log in with your ${campusInfo.shortName} student email (@${campusInfo.emailDomain}) and password.`
                      : `Log in instantly with a 6-digit one-time code sent directly to your phone via SMS.`}
                  </Text>

                  {/* Student Email or Phone */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      {loginMethod === 'password'
                        ? `${campusInfo.shortName} Student Email *`
                        : `${campusInfo.shortName} Email or Ghana Phone *`}
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder={
                        loginMethod === 'password'
                          ? `e.g. student@${campusInfo.emailDomain}`
                          : `e.g. 0241234567 or student@${campusInfo.emailDomain}`
                      }
                      keyboardType={loginMethod === 'password' ? 'email-address' : 'default'}
                      autoCapitalize="none"
                      value={email}
                      onChangeText={(val) => {
                        setEmail(val);
                        setErrorMessage(null);
                      }}
                    />
                  </View>

                  {/* Password Field (Only for password login) */}
                  {loginMethod === 'password' && (
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
                  )}

                  {/* Submit Button */}
                  <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={loginMethod === 'password' ? handlePasswordLogin : handleStartLoginOtp}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.submitBtnText}>
                        {loginMethod === 'password'
                          ? `🔑 Log In to ${campusInfo.shortName}`
                          : `📱 Send 6-Digit SMS Login Code`}
                      </Text>
                    )}
                  </TouchableOpacity>

                  {/* Demo Fill */}
                  <TouchableOpacity
                    style={styles.demoFillBtn}
                    onPress={() => {
                      setEmail(`student@${campusInfo.emailDomain}`);
                      setPassword('campus2026');
                      setWhatsAppNumber('0241234567');
                      setErrorMessage(null);
                    }}
                  >
                    <Text style={styles.demoFillBtnText}>💡 Demo Fill {campusInfo.shortName} Credentials</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* REGISTRATION TAB */
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
                    <Text style={styles.label}>Ghana Phone Number (For SMS Verification) *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. 0241234567"
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
                    onPress={handleStartRegisterOtp}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.submitBtnText}>📱 Send SMS Verification Code</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          )}
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
  loginMethodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  methodOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  methodOptionActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
  },
  methodOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  methodOptionTextActive: {
    color: '#059669',
    fontWeight: '800',
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
    marginBottom: 12,
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
  // OTP Verification Specific Styles
  otpContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  otpIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  otpIcon: {
    fontSize: 32,
  },
  otpTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  otpSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
  },
  phoneBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  phoneBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  otpInputGroup: {
    width: '100%',
    marginBottom: 12,
  },
  otpTextInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#059669',
    borderRadius: 16,
    paddingVertical: 14,
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: 8,
  },
  devOtpBtn: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  devOtpText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  resendRow: {
    marginVertical: 10,
    alignItems: 'center',
  },
  resendTimerText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  resendActionText: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '700',
  },
  backLink: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  backLinkText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
});
