import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/theme';
import { useAuthStore } from '@/stores/authStore';
import { isValidPhoneNumber, formatPhoneNumber } from '@/types/auth';

export default function AuthScreen() {
  const [step, setStep] = useState<'phone' | 'verification' | 'name'>('phone');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [name, setName] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const {
    is_loading,
    verification,
    sendVerificationCode,
    verifyCodeAndSignIn,
    clearVerification,
    setVerificationError,
  } = useAuthStore();

  useEffect(() => {
    // Clear any previous verification state when component mounts
    clearVerification();
  }, [clearVerification]);

  useEffect(() => {
    // Auto-advance to verification step when code is sent
    if (verification?.code_sent && step === 'phone') {
      setStep('verification');
    }
  }, [verification?.code_sent, step]);

  const handleSendCode = async () => {
    setPhoneError('');
    
    if (!phone.trim()) {
      setPhoneError('Please enter your phone number');
      return;
    }

    const formattedPhone = formatPhoneNumber(phone);
    if (!isValidPhoneNumber(formattedPhone)) {
      setPhoneError('Please enter a valid phone number');
      return;
    }

    const result = await sendVerificationCode(formattedPhone);
    if (result.success) {
      setPhone(formattedPhone);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      setVerificationError('Please enter the 6-digit verification code');
      return;
    }

    // First-time users need to provide a name
    if (!name.trim()) {
      setStep('name');
      return;
    }

    const result = await verifyCodeAndSignIn(phone, verificationCode, name);
    if (!result.success) {
      // Error is handled by the store
    }
  };

  const handleSetName = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    
    // Go back to verification step to complete sign-in
    setStep('verification');
    handleVerifyCode();
  };

  const handleBackToPhone = () => {
    setStep('phone');
    clearVerification();
    setVerificationCode('');
  };

  const renderPhoneStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Welcome to Birthday Tracker</Text>
      <Text style={styles.subtitle}>Enter your phone number to get started</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, phoneError ? styles.inputError : null]}
          placeholder="Phone number (e.g., +1234567890)"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          editable={!is_loading}
        />
        {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
        {verification?.error ? <Text style={styles.errorText}>{verification.error}</Text> : null}
      </View>

      <TouchableOpacity
        style={[styles.button, is_loading && styles.buttonDisabled]}
        onPress={handleSendCode}
        disabled={is_loading}
      >
        {is_loading ? (
          <ActivityIndicator color={theme.colors.neutral.white} />
        ) : (
          <Text style={styles.buttonText}>Send Verification Code</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.helperText}>
        We'll send you a 6-digit code to verify your number
      </Text>
    </View>
  );

  const renderVerificationStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Enter Verification Code</Text>
      <Text style={styles.subtitle}>
        We sent a code to {phone}
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, styles.codeInput]}
          placeholder="6-digit code"
          value={verificationCode}
          onChangeText={setVerificationCode}
          keyboardType="numeric"
          maxLength={6}
          autoComplete="sms-otp"
          textContentType="oneTimeCode"
          editable={!is_loading}
        />
        {verification?.error ? <Text style={styles.errorText}>{verification.error}</Text> : null}
      </View>

      <TouchableOpacity
        style={[styles.button, is_loading && styles.buttonDisabled]}
        onPress={handleVerifyCode}
        disabled={is_loading}
      >
        {is_loading ? (
          <ActivityIndicator color={theme.colors.neutral.white} />
        ) : (
          <Text style={styles.buttonText}>Verify & Sign In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={handleBackToPhone}
        disabled={is_loading}
      >
        <Text style={styles.linkButtonText}>Change phone number</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => sendVerificationCode(phone)}
        disabled={is_loading}
      >
        <Text style={styles.linkButtonText}>Resend code</Text>
      </TouchableOpacity>
    </View>
  );

  const renderNameStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>What's your name?</Text>
      <Text style={styles.subtitle}>
        This will help personalize your experience
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Your name"
          value={name}
          onChangeText={setName}
          autoComplete="name"
          textContentType="name"
          autoCapitalize="words"
          editable={!is_loading}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, is_loading && styles.buttonDisabled]}
        onPress={handleSetName}
        disabled={is_loading}
      >
        {is_loading ? (
          <ActivityIndicator color={theme.colors.neutral.white} />
        ) : (
          <Text style={styles.buttonText}>Continue</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => setStep('verification')}
        disabled={is_loading}
      >
        <Text style={styles.linkButtonText}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {step === 'phone' && renderPhoneStep()}
          {step === 'verification' && renderVerificationStep()}
          {step === 'name' && renderNameStep()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  stepContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.fontSize.xxlarge,
    fontWeight: '700',
    color: theme.colors.neutral.gray900,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.neutral.gray600,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  inputContainer: {
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  input: {
    width: '100%',
    height: 56,
    borderWidth: 1,
    borderColor: theme.colors.neutral.gray300,
    borderRadius: 12,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.typography.fontSize.medium,
    backgroundColor: theme.colors.neutral.white,
  },
  inputError: {
    borderColor: theme.colors.status.error,
  },
  codeInput: {
    textAlign: 'center',
    fontSize: theme.typography.fontSize.large,
    letterSpacing: 4,
  },
  button: {
    width: '100%',
    height: 56,
    backgroundColor: theme.colors.primary.blue600,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.neutral.gray400,
  },
  buttonText: {
    fontSize: theme.typography.fontSize.medium,
    fontWeight: '600',
    color: theme.colors.neutral.white,
  },
  linkButton: {
    padding: theme.spacing.sm,
    marginVertical: theme.spacing.xs,
  },
  linkButtonText: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.primary.blue600,
    textAlign: 'center',
  },
  errorText: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.status.error,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  helperText: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.neutral.gray500,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
});