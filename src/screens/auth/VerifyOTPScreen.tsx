import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { Button } from '../../components';
import { COLORS } from '../../constants';
import { AuthService } from '../../services';
import { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerifyOTP'>;

export const VerifyOTPScreen: React.FC<Props> = ({ navigation, route }) => {
  const { email } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [expirationTimer, setExpirationTimer] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    // Auto-send OTP when screen loads
    if (!otpSent) {
      handleSendOTP();
    }
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  useEffect(() => {
    if (expirationTimer > 0) {
      const interval = setInterval(() => {
        setExpirationTimer((prev) => {
          if (prev <= 1) {
            Alert.alert('OTP Expired', 'Please request a new OTP code.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [expirationTimer]);

  const handleSendOTP = async () => {
    setIsResending(true);
    try {
      const response = await AuthService.sendOTP(email);
      if (response.success) {
        Alert.alert('Success', 'OTP sent to your email');
        setResendTimer(30); // 30 second cooldown for resend
        setExpirationTimer(120); // 2 minutes (120 seconds) expiration
        setOtpSent(true);
      } else {
        Alert.alert('Error', response.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsResending(false);
    }
  };

  const handleOTPChange = (value: string, index: number) => {
    if (value.length > 1) {
      // Handle paste
      const otpArray = value.slice(0, 6).split('');
      const newOtp = [...otp];
      otpArray.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      
      // Focus on the last filled input or the next empty one
      const nextIndex = Math.min(index + otpArray.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    try {
      const response = await AuthService.verifyOTP(email, otpCode);
      if (response.success) {
        Alert.alert('Success', 'Email verified successfully! You can now login.', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]);
      } else {
        Alert.alert('Error', response.message || 'Invalid OTP');
      }
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.iconContainer}>
            <Icon name="mail" size={48} color={COLORS.white} />
          </View>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit code to{'\n'}
            <Text style={styles.email}>{email}</Text>
          </Text>
        </View>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[styles.otpInput, digit && styles.otpInputFilled]}
              value={digit}
              onChangeText={(value) => handleOTPChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Resend OTP */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          {resendTimer > 0 ? (
            <Text style={styles.timerText}>Resend in {resendTimer}s</Text>
          ) : (
            <TouchableOpacity onPress={handleSendOTP} disabled={isResending}>
              <Text style={styles.resendLink}>
                {isResending ? 'Sending...' : 'Resend'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Expiration Timer */}
        {expirationTimer > 0 && (
          <View style={styles.expirationContainer}>
            <Icon name="clock" size={16} color={COLORS.error} />
            <Text style={styles.expirationText}>
              Code expires in {Math.floor(expirationTimer / 60)}:{(expirationTimer % 60).toString().padStart(2, '0')}
            </Text>
          </View>
        )}

        {/* Verify Button */}
        <Button
          title="Verify Email"
          onPress={handleVerifyOTP}
          loading={isLoading}
          style={styles.verifyButton}
        />

        {/* Note */}
        <Text style={styles.note}>
          Please check your spam folder if you don't see the email in your inbox.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  email: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: COLORS.textPrimary,
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
    color: COLORS.white,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  resendText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  timerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  expirationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.error + '15',
    borderRadius: 8,
    alignSelf: 'center',
  },
  expirationText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.error,
  },
  verifyButton: {
    height: 56,
    borderRadius: 16,
    marginBottom: 24,
  },
  note: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});
