import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { Button, Input } from '../../components';
import { COLORS } from '../../constants';
import { validateEmail, validatePassword, validateName } from '../../utils';
import { AuthService } from '../../services';
import { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  acceptTerms?: string;
}

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'USER' as 'USER' | 'AGENT',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(?:\+8801\d{9}|01\d{9})$/.test(formData.phone)) {
      newErrors.phone = 'Enter valid BD number: +8801XXXXXXXXX or 01XXXXXXXXX';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = 'Password must contain at least 1 uppercase letter';
      } else if (!/[!@#$%^&*]/.test(formData.password)) {
        newErrors.password = 'Password must contain at least 1 special character (!@#$%^&*)';
      } else if (!/\d/.test(formData.password)) {
        newErrors.password = 'Password must contain at least 1 number';
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and privacy policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    setHasAttemptedSubmit(true);
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { confirmPassword, acceptTerms, ...registerData } = formData;
      const response = await AuthService.register(registerData);
      
      if (response.success) {
        Alert.alert(
          'Success',
          'Account created! Please verify your email.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('VerifyOTP', { email: formData.email }),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Registration failed');
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Registration failed. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
    
    // Revalidate if user has already attempted submit
    if (hasAttemptedSubmit) {
      // Revalidate the form to update errors in real-time
      const newErrors: FormErrors = {};
      const updatedFormData = { ...formData, [key]: value };

      // Validate name
      if (key === 'name' || !updatedFormData.name) {
        if (!updatedFormData.name) {
          newErrors.name = 'Name is required';
        } else if (updatedFormData.name.length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
        }
      }

      // Validate email
      if (key === 'email' || !updatedFormData.email) {
        if (!updatedFormData.email) {
          newErrors.email = 'Email is required';
        } else if (!validateEmail(updatedFormData.email)) {
          newErrors.email = 'Please enter a valid email';
        }
      }

      // Validate phone
      if (key === 'phone' || !updatedFormData.phone) {
        if (!updatedFormData.phone) {
          newErrors.phone = 'Phone number is required';
        } else if (!/^(?:\+8801\d{9}|01\d{9})$/.test(updatedFormData.phone)) {
          newErrors.phone = 'Enter valid BD number: +8801XXXXXXXXX or 01XXXXXXXXX';
        }
      }

      // Validate password
      if (key === 'password' || !updatedFormData.password) {
        if (!updatedFormData.password) {
          newErrors.password = 'Password is required';
        } else {
          if (updatedFormData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
          } else if (!/[A-Z]/.test(updatedFormData.password)) {
            newErrors.password = 'Password must contain at least 1 uppercase letter';
          } else if (!/[!@#$%^&*]/.test(updatedFormData.password)) {
            newErrors.password = 'Password must contain at least 1 special character (!@#$%^&*)';
          } else if (!/\d/.test(updatedFormData.password)) {
            newErrors.password = 'Password must contain at least 1 number';
          }
        }
      }

      // Validate confirm password
      if (key === 'confirmPassword' || key === 'password') {
        if (!updatedFormData.confirmPassword) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (updatedFormData.password !== updatedFormData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
      }

      setErrors(newErrors);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join EPay and start transacting securely
            </Text>
          </View>

          {/* Role Selection */}
          <View style={styles.roleContainer}>
            <Text style={styles.roleLabel}>Register as:</Text>
            <View style={styles.roleButtons}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  formData.role === 'USER' && styles.roleButtonActive,
                ]}
                onPress={() => updateFormData('role', 'USER')}>
                <Text
                  style={[
                    styles.roleButtonText,
                    formData.role === 'USER' && styles.roleButtonTextActive,
                  ]}>
                  User
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  formData.role === 'AGENT' && styles.roleButtonActive,
                ]}
                onPress={() => updateFormData('role', 'AGENT')}>
                <Text
                  style={[
                    styles.roleButtonText,
                    formData.role === 'AGENT' && styles.roleButtonTextActive,
                  ]}>
                  Agent
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              leftIcon="user"
              error={errors.name}
            />

            <Input
              label="Email Address"
              placeholder="john.doe@company.com"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail"
              error={errors.email}
            />

            <Input
              label="Phone Number"
              placeholder="01XXXXXXXXX or +8801XXXXXXXXX"
              value={formData.phone}
              onChangeText={(value) => updateFormData('phone', value)}
              keyboardType="phone-pad"
              leftIcon="phone"
              error={errors.phone}
            />

            <Input
              label="Password"
              placeholder="Min 8 chars, 1 uppercase, 1 number, 1 special char"
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              isPassword
              leftIcon="lock"
              error={errors.password}
            />

            <Input
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData('confirmPassword', value)}
              isPassword
              leftIcon="lock"
              error={errors.confirmPassword}
            />

            {/* Accept Terms */}
            <TouchableOpacity
              style={styles.termsCheckbox}
              onPress={() => setFormData({ ...formData, acceptTerms: !formData.acceptTerms })}>
              <View style={[styles.checkbox, formData.acceptTerms && styles.checkboxChecked]}>
                {formData.acceptTerms && <Icon name="check" size={16} color={COLORS.white} />}
              </View>
              <Text style={styles.termsCheckboxText}>
                I agree to the{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
            {errors.acceptTerms && (
              <Text style={styles.errorText}>{errors.acceptTerms}</Text>
            )}

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={isLoading}
              style={styles.registerButton}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginTop: 20,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  roleContainer: {
    marginBottom: 24,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  roleButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  roleButtonTextActive: {
    color: COLORS.white,
  },
  form: {
    marginBottom: 24,
  },
  termsCheckbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    marginBottom: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  termsCheckboxText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginLeft: 30,
    marginTop: 4,
  },
  registerButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  signInText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
