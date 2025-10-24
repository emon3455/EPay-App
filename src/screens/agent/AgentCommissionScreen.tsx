import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TransactionService } from '../../services';
import { useAppSelector } from '../../store/hooks';
import { COLORS } from '../../constants';
import { MainStackParamList } from '../../navigation/types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  commission: number;
  createdAt: string;
  sender?: { email?: string; phone?: string };
  receiver?: { email?: string; phone?: string };
}

const AgentCommissionScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const user = useAppSelector((state) => state.auth.user);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCommission, setTotalCommission] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCommission = async () => {
    try {
      if (!user?._id) {
        console.log('No user ID available');
        return;
      }
      
      console.log('Fetching commission for agent:', user._id);
      const response = await TransactionService.getAgentCommission(user._id);
      
      console.log('Commission API Response:', JSON.stringify(response, null, 2));
      
      if (response.success) {
        console.log('Transactions:', response.data?.transactions?.length || 0);
        console.log('Total Commission:', response.data?.totalCommission);
        // Backend returns data: { totalCommission, transactions }
        setTransactions(response.data?.transactions || []);
        setTotalCommission(response.data?.totalCommission || 0);
      } else {
        console.log('API returned success: false');
      }
    } catch (error: any) {
      console.error('Failed to fetch commission:', error?.response?.data?.message || error.message);
      console.error('Error details:', JSON.stringify(error?.response?.data, null, 2));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCommission();
  }, [user?._id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCommission();
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'CASHIN':
        return 'cash-plus';
      case 'CASHOUT':
        return 'cash-minus';
      case 'SENDMONEY':
        return 'bank-transfer';
      default:
        return 'cash';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'CASHIN':
        return COLORS.success;
      case 'CASHOUT':
        return COLORS.warning;
      case 'SENDMONEY':
        return COLORS.primary;
      default:
        return COLORS.textPrimary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={[styles.iconContainer, { backgroundColor: getTransactionColor(item.type) + '20' }]}>
          <Icon name={getTransactionIcon(item.type)} size={24} color={getTransactionColor(item.type)} />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionType}>{item.type}</Text>
          <Text style={styles.transactionDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.transactionAmount}>৳{item.amount.toFixed(2)}</Text>
          <Text style={styles.commissionAmount}>+৳{(item.commission || 0).toFixed(2)}</Text>
        </View>
      </View>
      <View style={styles.transactionFooter}>
        <Text style={styles.transactionId}>Txn: {item._id}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>My Earnings</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading earnings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>My Earnings</Text>
        <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
          <Icon 
            name="refresh" 
            size={24} 
            color={COLORS.primary} 
            style={refreshing ? styles.rotating : undefined}
          />
        </TouchableOpacity>
      </View>

      {/* Total Commission Card */}
      <View style={styles.totalCard}>
        <View style={styles.totalCardHeader}>
          <Icon name="currency-bdt" size={32} color={COLORS.white} />
          <Text style={styles.totalLabel}>Total Commission Earned</Text>
        </View>
        <Text style={styles.totalAmount}>৳{totalCommission.toFixed(2)}</Text>
        <Text style={styles.totalSubtext}>
          From {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Transaction List */}
      {transactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="cash-remove" size={64} color={COLORS.gray300} />
          <Text style={styles.emptyText}>No commission earnings yet</Text>
          <Text style={styles.emptySubtext}>
            Start earning by helping users with cash-in and cash-out services
          </Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  rotating: {
    transform: [{ rotate: '360deg' }],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  totalCard: {
    margin: 20,
    padding: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  totalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: COLORS.white,
    marginLeft: 8,
    opacity: 0.9,
  },
  totalAmount: {
    fontSize: 42,
    fontWeight: '800',
    color: COLORS.white,
    marginVertical: 8,
  },
  totalSubtext: {
    fontSize: 13,
    color: COLORS.white,
    opacity: 0.8,
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  transactionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  commissionAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.success,
  },
  transactionFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  transactionId: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default AgentCommissionScreen;
