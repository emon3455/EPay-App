import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';
import { Button, Input } from '../../components';
import { COLORS } from '../../constants';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { withdrawMoney } from '../../store/slices/walletSlice';
import { MainStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'WithdrawMoney'>;

export const WithdrawMoneyScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isLoading, wallet } = useAppSelector((state) => state.wallet);

  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState<{ amount?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: any = {};

    if (!amount) {
      newErrors.amount = 'Amount is required';
    } else if (parseFloat(amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (wallet && parseFloat(amount) > wallet.balance) {
      newErrors.amount = 'Insufficient balance';
    } else if (parseFloat(amount) < 50) {
      newErrors.amount = 'Minimum withdrawal amount is ৳50';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleWithdraw = async () => {
    if (validateForm()) {
      try {
        await dispatch(withdrawMoney({
          amount: parseFloat(amount),
        })).unwrap();

        Alert.alert('Success', 'Money withdrawn successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } catch (error: any) {
        Alert.alert('Error', error || 'Failed to withdraw money');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Icon
              name="arrow-left"
              size={24}
              color={COLORS.textPrimary}
              onPress={() => navigation.goBack()}
            />
            <Text style={styles.headerTitle}>Withdraw Money</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Balance Display */}
          {wallet && (
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>৳ {wallet.balance.toFixed(2)}</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Amount (৳)"
              placeholder="Enter amount to withdraw"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              leftIcon="dollar-sign"
              error={errors.amount}
            />

            <Button
              title="Withdraw Money"
              onPress={handleWithdraw}
              loading={isLoading}
              style={styles.button}
            />
          </View>

          {/* Info */}
          <View style={styles.infoCard}>
            <Icon name="info" size={20} color={COLORS.warning} />
            <Text style={styles.infoText}>
              Minimum withdrawal amount is ৳50. Money will be transferred to your linked bank account.
            </Text>
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
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  balanceCard: {
    backgroundColor: COLORS.warning,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  form: {
    marginBottom: 24,
  },
  button: {
    marginTop: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '10',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.warning,
    lineHeight: 20,
  },
});
