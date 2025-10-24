import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';
import { Button, Input } from '../../components';
import { COLORS } from '../../constants';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { sendMoney } from '../../store/slices/walletSlice';
import { MainStackParamList } from '../../navigation/types';
import apiClient from '../../services/api.service';

type Props = NativeStackScreenProps<MainStackParamList, 'SendMoney'>;

interface User {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
}

export const SendMoneyScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isLoading, wallet } = useAppSelector((state) => state.wallet);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [amount, setAmount] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState<{ recipient?: string; amount?: string }>({});
  const [recentUsers, setRecentUsers] = useState<User[]>([]);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length > 0 && showModal) {
      const timer = setTimeout(() => {
        searchUsers(searchQuery);
      }, 300);
      return () => clearTimeout(timer);
    } else if (searchQuery.length === 0 && showModal) {
      setUsers([]);
    }
  }, [searchQuery, showModal]);

  const searchUsers = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await apiClient.get(`/user/all-user`, {
        params: { searchTerm: query, limit: 10 }
      });
      
      console.log('Search results:', response.data);
      
      if (response.data.success) {
        setUsers(response.data.data || []);
      }
    } catch (error: any) {
      console.error('Search error:', error);
      setUsers([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setShowModal(false);
    setSearchQuery('');
    setErrors({ ...errors, recipient: undefined });
    
    // Add to recent users
    setRecentUsers(prev => {
      const filtered = prev.filter(u => u._id !== user._id);
      return [user, ...filtered].slice(0, 6);
    });
  };

  const openModal = () => {
    setShowModal(true);
    setSearchQuery('');
    setUsers([]);
  };

  const validateForm = (): boolean => {
    const newErrors: any = {};

    if (!selectedUser) {
      newErrors.recipient = 'Please select a recipient';
    }

    if (!amount) {
      newErrors.amount = 'Amount is required';
    } else if (parseFloat(amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (wallet && parseFloat(amount) > wallet.balance) {
      newErrors.amount = 'Insufficient balance';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendMoney = async () => {
    if (validateForm() && selectedUser) {
      try {
        await dispatch(sendMoney({
          receiverEmailOrPhone: selectedUser.email || selectedUser.phone!,
          amount: parseFloat(amount),
        })).unwrap();

        Alert.alert('Success', `৳${parseFloat(amount).toFixed(2)} sent to ${selectedUser.name}!`, [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } catch (error: any) {
        Alert.alert('Error', error || 'Failed to send money');
      }
    }
  };

  const clearSelection = () => {
    setSelectedUser(null);
  };

  const calculateFee = () => {
    const amt = parseFloat(amount) || 0;
    const feeRate = 0.02; // 2% fee
    return amt * feeRate;
  };

  const calculateTotal = () => {
    const amt = parseFloat(amount) || 0;
    return amt + calculateFee();
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
            <Text style={styles.headerTitle}>Send Money</Text>
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
            {/* Recipient Selector */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Recipient</Text>
              <TouchableOpacity
                style={styles.recipientSelector}
                onPress={openModal}
              >
                <Icon name="user" size={18} color={COLORS.gray500} style={styles.inputIcon} />
                <Text style={[styles.recipientText, !selectedUser && styles.placeholderText]}>
                  {selectedUser 
                    ? `${selectedUser.name} • ${selectedUser.email || selectedUser.phone || ''}`
                    : 'Search name, phone or email...'
                  }
                </Text>
                <Icon name="chevron-down" size={18} color={COLORS.gray500} />
              </TouchableOpacity>
              {errors.recipient && (
                <Text style={styles.errorText}>{errors.recipient}</Text>
              )}
            </View>

            {/* Recent Recipients */}
            {recentUsers.length > 0 && !selectedUser && (
              <View style={styles.recentContainer}>
                <Text style={styles.recentLabel}>Recent</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentScroll}>
                  {recentUsers.map((user) => (
                    <TouchableOpacity
                      key={user._id}
                      style={styles.recentChip}
                      onPress={() => handleSelectUser(user)}
                    >
                      <Icon name="user" size={14} color={COLORS.primary} />
                      <Text style={styles.recentChipText} numberOfLines={1}>
                        {user.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Amount Input */}
            <Input
              label="Amount (৳)"
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              leftIcon="dollar-sign"
              error={errors.amount}
            />

            {/* Fee Summary */}
            {amount && parseFloat(amount) > 0 && (
              <View style={styles.feeCard}>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Send amount</Text>
                  <Text style={styles.feeValue}>৳{parseFloat(amount).toFixed(2)}</Text>
                </View>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Fee (2.00%)</Text>
                  <Text style={styles.feeValue}>৳{calculateFee().toFixed(2)}</Text>
                </View>
                <View style={styles.feeDivider} />
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabelBold}>Total to debit</Text>
                  <Text style={[styles.feeValueBold, wallet && calculateTotal() > wallet.balance && styles.errorAmount]}>
                    ৳{calculateTotal().toFixed(2)}
                  </Text>
                </View>
              </View>
            )}

            <Button
              title="Send Now"
              onPress={handleSendMoney}
              loading={isLoading}
              style={styles.button}
              disabled={!selectedUser || !amount || parseFloat(amount) <= 0}
            />
          </View>

          {/* Info */}
          <View style={styles.infoCard}>
            <Icon name="info" size={20} color={COLORS.info} />
            <Text style={styles.infoText}>
              Money will be instantly transferred to the receiver's wallet
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Search Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Recipient</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Icon name="x" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.modalSearchContainer}>
              <Icon name="search" size={18} color={COLORS.gray500} style={styles.inputIcon} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search users..."
                placeholderTextColor={COLORS.gray400}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={true}
              />
              {isSearching && (
                <ActivityIndicator size="small" color={COLORS.primary} />
              )}
            </View>

            {/* Results List */}
            <FlatList
              data={users}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalUserItem}
                  onPress={() => handleSelectUser(item)}
                >
                  <View style={styles.userAvatar}>
                    <Icon name="user" size={16} color={COLORS.primary} />
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userContact}>
                      {item.email || item.phone || '—'}
                    </Text>
                  </View>
                  {selectedUser?._id === item._id && (
                    <Icon name="check" size={18} color={COLORS.success} />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                searchQuery.length > 0 ? (
                  <View style={styles.emptyState}>
                    {isSearching ? (
                      <>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.emptyText}>Searching...</Text>
                      </>
                    ) : (
                      <>
                        <Icon name="search" size={48} color={COLORS.gray300} />
                        <Text style={styles.emptyText}>No users found</Text>
                      </>
                    )}
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <Icon name="users" size={48} color={COLORS.gray300} />
                    <Text style={styles.emptyText}>Start typing to search users</Text>
                  </View>
                )
              }
              style={styles.modalList}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </View>
      </Modal>
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
    backgroundColor: COLORS.primary,
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
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  recipientSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  recipientText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  placeholderText: {
    color: COLORS.gray400,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 12,
    height: 48,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },
  modalList: {
    marginTop: 16,
  },
  modalUserItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  userContact: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.gray400,
    marginTop: 16,
  },
  recentContainer: {
    marginBottom: 16,
  },
  recentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  recentScroll: {
    flexGrow: 0,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    gap: 6,
  },
  recentChipText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    maxWidth: 100,
  },
  feeCard: {
    backgroundColor: COLORS.gray100,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  feeLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  feeValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  feeLabelBold: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  feeValueBold: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  errorAmount: {
    color: COLORS.error,
  },
  feeDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  button: {
    marginTop: 8,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.info + '10',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.info,
    lineHeight: 20,
  },
});
