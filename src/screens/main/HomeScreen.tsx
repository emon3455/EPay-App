import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';
import { WalletCard, QuickAction, TransactionItem } from '../../components';
import { COLORS } from '../../constants';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchWallet, fetchTransactions } from '../../store/slices/walletSlice';
import { logoutUser } from '../../store/slices/authSlice';
import { MainStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'Home'>;

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

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const recentTransactions = transactions.slice(0, 5);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello �</Text>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Profile')}
            style={styles.profileButton}
          >
            <Icon name="user" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Wallet Card */}
        {wallet && (
          <WalletCard
            balance={wallet.balance}
            status={wallet.status}
            onRefresh={loadData}
          />
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            {user?.role === 'AGENT' ? (
              <>
                <QuickAction
                  icon="plus-circle"
                  label="Cash-In"
                  color={COLORS.success}
                  onPress={() => navigation.navigate('CashIn')}
                />
                <QuickAction
                  icon="minus-circle"
                  label="Cash-Out"
                  color={COLORS.error}
                  onPress={() => navigation.navigate('CashOut')}
                />
                <QuickAction
                  icon="clock"
                  label="History"
                  color={COLORS.info}
                  onPress={() => navigation.navigate('Transactions')}
                />
                <QuickAction
                  icon="trending-up"
                  label="Commission"
                  color={COLORS.warning}
                  onPress={() => {/* TODO: Show commission */}}
                />
              </>
            ) : (
              <>
                <QuickAction
                  icon="arrow-up-circle"
                  label="Send Money"
                  color={COLORS.primary}
                  onPress={() => navigation.navigate('SendMoney')}
                />
                <QuickAction
                  icon="arrow-down-circle"
                  label="Add Money"
                  color={COLORS.success}
                  onPress={() => navigation.navigate('AddMoney')}
                />
                <QuickAction
                  icon="arrow-up"
                  label="Withdraw"
                  color={COLORS.warning}
                  onPress={() => navigation.navigate('WithdrawMoney')}
                />
                <QuickAction
                  icon="clock"
                  label="History"
                  color={COLORS.info}
                  onPress={() => navigation.navigate('Transactions')}
                />
              </>
            )}
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            {transactions.length > 5 && (
              <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            )}
          </View>

          {recentTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="inbox" size={48} color={COLORS.gray300} />
              <Text style={styles.emptyText}>No transactions yet</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  greeting: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
});
