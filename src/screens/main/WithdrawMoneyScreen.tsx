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
import { withdrawMoney } from '../../store/slices/walletSlice';
import { MainStackParamList } from '../../navigation/types';
import apiClient from '../../services/api.service';

type Props = NativeStackScreenProps<MainStackParamList, 'WithdrawMoney'>;

interface Agent {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
}

export const WithdrawMoneyScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isLoading, wallet } = useAppSelector((state) => state.wallet);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [amount, setAmount] = useState('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState<{ agent?: string; amount?: string }>({});
  const [recentAgents, setRecentAgents] = useState<Agent[]>([]);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length > 0 && showModal) {
      const timer = setTimeout(() => {
        searchAgents(searchQuery);
      }, 300);
      return () => clearTimeout(timer);
    } else if (searchQuery.length === 0 && showModal) {
      setAgents([]);
    }
  }, [searchQuery, showModal]);

  const searchAgents = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await apiClient.get(`/user/all-agent`, {
        params: { searchTerm: query, limit: 10, isActive: 'ACTIVE' }
      });
      
      console.log('Agent search results:', response.data);
      
      if (response.data.success) {
        setAgents(response.data.data || []);
      }
    } catch (error: any) {
      console.error('Agent search error:', error);
      setAgents([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowModal(false);
    setSearchQuery('');
    setErrors({ ...errors, agent: undefined });
    
    // Add to recent agents
    setRecentAgents(prev => {
      const filtered = prev.filter(a => a._id !== agent._id);
      return [agent, ...filtered].slice(0, 6);
    });
  };

  const openModal = () => {
    setShowModal(true);
    setSearchQuery('');
    setAgents([]);
  };

  const clearAgentSelection = () => {
    setSelectedAgent(null);
  };

  const calculateFee = () => {
    const amt = parseFloat(amount) || 0;
    const feeRate = 0.03; // 3% fee for withdraw
    return amt * feeRate;
  };

  const calculateTotal = () => {
    const amt = parseFloat(amount) || 0;
    return amt + calculateFee();
  };

  const calculateMaxAmount = () => {
    if (!wallet) return 0;
    const feeRate = 0.03;
    const denom = 1 + feeRate;
    const raw = denom > 0 ? wallet.balance / denom : wallet.balance;
    return Math.max(0, Math.floor(raw * 100) / 100);
  };

  const validateForm = (): boolean => {
    const newErrors: any = {};

    if (!selectedAgent) {
      newErrors.agent = 'Please select an agent';
    }

    if (!amount) {
      newErrors.amount = 'Amount is required';
    } else if (parseFloat(amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (wallet && calculateTotal() > wallet.balance) {
      newErrors.amount = 'Insufficient balance (including fee)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleWithdraw = async () => {
    if (validateForm() && selectedAgent) {
      try {
        await dispatch(withdrawMoney({
          amount: parseFloat(amount),
          agentId: selectedAgent._id,
        })).unwrap();

        Alert.alert('Success', `৳${parseFloat(amount).toFixed(2)} withdrawn via ${selectedAgent.name}!`, [
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
            {/* Agent Selector */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Select Agent</Text>
              <TouchableOpacity
                style={styles.agentSelector}
                onPress={openModal}
              >
                <Icon name="user" size={18} color={COLORS.gray500} style={styles.inputIcon} />
                <Text style={[styles.agentText, !selectedAgent && styles.placeholderText]}>
                  {selectedAgent 
                    ? `${selectedAgent.name} • ${selectedAgent.email || selectedAgent.phone || ''}`
                    : 'Search agent by name, phone or email...'
                  }
                </Text>
                <Icon name="chevron-down" size={18} color={COLORS.gray500} />
              </TouchableOpacity>
              {errors.agent && (
                <Text style={styles.errorText}>{errors.agent}</Text>
              )}
            </View>

            {/* Recent Agents */}
            {recentAgents.length > 0 && !selectedAgent && (
              <View style={styles.recentContainer}>
                <Text style={styles.recentLabel}>Recent Agents</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentScroll}>
                  {recentAgents.map((agent) => (
                    <TouchableOpacity
                      key={agent._id}
                      style={styles.recentChip}
                      onPress={() => handleSelectAgent(agent)}
                    >
                      <Icon name="user" size={14} color={COLORS.warning} />
                      <Text style={styles.recentChipText} numberOfLines={1}>
                        {agent.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Amount Input */}
            <View style={styles.amountContainer}>
              <Text style={styles.label}>Amount (৳)</Text>
              <View style={styles.amountInputWrapper}>
                <Icon name="dollar-sign" size={18} color={COLORS.gray500} style={styles.inputIcon} />
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.gray400}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                />
                <TouchableOpacity
                  style={styles.maxButton}
                  onPress={() => setAmount(calculateMaxAmount().toFixed(2))}
                >
                  <Text style={styles.maxButtonText}>Use max</Text>
                </TouchableOpacity>
              </View>
              {errors.amount && (
                <Text style={styles.errorText}>{errors.amount}</Text>
              )}
            </View>

            {/* Fee Summary */}
            {amount && parseFloat(amount) > 0 && (
              <View style={styles.feeCard}>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Withdraw amount</Text>
                  <Text style={styles.feeValue}>৳{parseFloat(amount).toFixed(2)}</Text>
                </View>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Fee (3.00%)</Text>
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
              title="Withdraw Now"
              onPress={handleWithdraw}
              loading={isLoading}
              style={styles.button}
              disabled={!selectedAgent || !amount || parseFloat(amount) <= 0}
            />
          </View>

          {/* Info */}
          <View style={styles.infoCard}>
            <Icon name="shield" size={20} color={COLORS.success} />
            <Text style={styles.infoText}>
              Withdrawals are secure & instant.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Agent Search Modal */}
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
              <Text style={styles.modalTitle}>Select Agent</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Icon name="x" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.modalSearchContainer}>
              <Icon name="search" size={18} color={COLORS.gray500} style={styles.inputIcon} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search agents..."
                placeholderTextColor={COLORS.gray400}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={true}
              />
              {isSearching && (
                <ActivityIndicator size="small" color={COLORS.warning} />
              )}
            </View>

            {/* Results List */}
            <FlatList
              data={agents}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalAgentItem}
                  onPress={() => handleSelectAgent(item)}
                >
                  <View style={styles.agentAvatar}>
                    <Icon name="user" size={16} color={COLORS.warning} />
                  </View>
                  <View style={styles.agentInfo}>
                    <Text style={styles.agentName}>{item.name}</Text>
                    <Text style={styles.agentContact}>
                      {item.email || item.phone || '—'}
                    </Text>
                  </View>
                  {selectedAgent?._id === item._id && (
                    <Icon name="check" size={18} color={COLORS.success} />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                searchQuery.length > 0 ? (
                  <View style={styles.emptyState}>
                    {isSearching ? (
                      <>
                        <ActivityIndicator size="large" color={COLORS.warning} />
                        <Text style={styles.emptyText}>Searching...</Text>
                      </>
                    ) : (
                      <>
                        <Icon name="search" size={48} color={COLORS.gray300} />
                        <Text style={styles.emptyText}>No agents found</Text>
                      </>
                    )}
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <Icon name="users" size={48} color={COLORS.gray300} />
                    <Text style={styles.emptyText}>Start typing to search agents</Text>
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
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  agentSelector: {
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
  agentText: {
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
  amountContainer: {
    marginBottom: 16,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 48,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },
  maxButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.gray50,
  },
  maxButtonText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '600',
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
    backgroundColor: COLORS.success + '10',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.success,
    lineHeight: 20,
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
  modalAgentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  agentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.warning + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  agentContact: {
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
});
