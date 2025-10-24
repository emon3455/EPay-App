import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';
import { TransactionItem } from '../../components';
import { COLORS } from '../../constants';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchWallet, fetchTransactions } from '../../store/slices/walletSlice';
import { MainStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'Home'>;

const { width } = Dimensions.get('window');

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { wallet, transactions, isLoading } = useAppSelector((state) => state.wallet);
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    dispatch(fetchWallet());
    dispatch(fetchTransactions());
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const recentTransactions = transactions.slice(0, 4);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Header with Wallet Card */}
        <View style={styles.headerSection}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.userInfo}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
            </View>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Profile')}
              style={styles.avatarButton}
            >
              <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
            </TouchableOpacity>
          </View>

          {/* Wallet Balance Card */}
          {wallet && (
            <View style={styles.balanceCard}>
              <View style={styles.balanceContent}>
                <View>
                  <Text style={styles.balanceLabel}>Total Balance</Text>
                  <Text style={styles.balanceAmount}>৳{wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                </View>
                <View style={styles.balanceActions}>
                  <TouchableOpacity style={styles.eyeButton}>
                    <Icon name="eye" size={18} color={COLORS.white} />
                  </TouchableOpacity>
                  <View style={[styles.statusDot, { backgroundColor: wallet.status === 'ACTIVE' ? '#10b981' : '#ef4444' }]} />
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Services Section */}
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Services</Text>
          
          {user?.role === 'AGENT' ? (
            <View style={styles.servicesRow}>
              <TouchableOpacity 
                style={styles.serviceItem}
                onPress={() => navigation.navigate('CashIn')}
              >
                <View style={[styles.serviceIcon, { backgroundColor: '#10b981' }]}>
                  <Icon name="log-in" size={22} color={COLORS.white} />
                </View>
                <Text style={styles.serviceLabel}>Cash In</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.serviceItem}
                onPress={() => navigation.navigate('CashOut')}
              >
                <View style={[styles.serviceIcon, { backgroundColor: '#f59e0b' }]}>
                  <Icon name="log-out" size={22} color={COLORS.white} />
                </View>
                <Text style={styles.serviceLabel}>Cash Out</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.serviceItem}
                onPress={() => {/* TODO: Show commission */}}
              >
                <View style={[styles.serviceIcon, { backgroundColor: '#8b5cf6' }]}>
                  <Icon name="award" size={22} color={COLORS.white} />
                </View>
                <Text style={styles.serviceLabel}>Earnings</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.serviceItem}
                onPress={() => navigation.navigate('Transactions')}
              >
                <View style={[styles.serviceIcon, { backgroundColor: '#3b82f6' }]}>
                  <Icon name="list" size={22} color={COLORS.white} />
                </View>
                <Text style={styles.serviceLabel}>History</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.servicesRow}>
              <TouchableOpacity 
                style={styles.serviceItem}
                onPress={() => navigation.navigate('SendMoney')}
              >
                <View style={[styles.serviceIcon, { backgroundColor: COLORS.primary }]}>
                  <Icon name="send" size={22} color={COLORS.white} />
                </View>
                <Text style={styles.serviceLabel}>Send</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.serviceItem}
                onPress={() => navigation.navigate('WithdrawMoney')}
              >
                <View style={[styles.serviceIcon, { backgroundColor: '#f59e0b' }]}>
                  <Icon name="download" size={22} color={COLORS.white} />
                </View>
                <Text style={styles.serviceLabel}>Withdraw</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.serviceItem}
                onPress={() => navigation.navigate('Transactions')}
              >
                <View style={[styles.serviceIcon, { backgroundColor: '#3b82f6' }]}>
                  <Icon name="clock" size={22} color={COLORS.white} />
                </View>
                <Text style={styles.serviceLabel}>History</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsSection}>
          <View style={styles.transactionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            {transactions.length > 4 && (
              <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            )}
          </View>

          {recentTransactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="file-text" size={48} color={COLORS.gray300} />
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptySubtitle}>Your recent transactions will appear here</Text>
            </View>
          ) : (
            recentTransactions.map((transaction) => (
              <TransactionItem
                key={transaction._id}
                transaction={transaction}
                onPress={() => {/* Navigate to transaction details */}}
              />
            ))
          )}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  headerSection: {
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
  },
  avatarButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  balanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 20,
  },
  balanceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 13,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 8,
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  balanceActions: {
    alignItems: 'center',
    gap: 12,
  },
  eyeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  servicesSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  servicesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  serviceItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  serviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  serviceLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  transactionsSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
