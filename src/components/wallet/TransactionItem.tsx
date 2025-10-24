import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants';
import { Transaction } from '../../types';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onPress }) => {
  const getTransactionIcon = () => {
    switch (transaction.type) {
      case 'ADD_MONEY': return 'arrow-down-circle';
      case 'WITHDRAW': return 'arrow-up-circle';
      case 'SEND_MONEY': return 'send';
      case 'CASH_IN': return 'plus-circle';
      case 'CASH_OUT': return 'minus-circle';
      default: return 'activity';
    }
  };

  const getTransactionColor = () => {
    switch (transaction.type) {
      case 'ADD_MONEY':
      case 'CASH_IN':
        return COLORS.success;
      case 'WITHDRAW':
      case 'SEND_MONEY':
      case 'CASH_OUT':
        return COLORS.error;
      default:
        return COLORS.gray500;
    }
  };

  const getTransactionSign = () => {
    switch (transaction.type) {
      case 'ADD_MONEY':
      case 'CASH_IN':
        return '+';
      case 'WITHDRAW':
      case 'SEND_MONEY':
      case 'CASH_OUT':
        return '-';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: getTransactionColor() + '20' }]}>
        <Icon name={getTransactionIcon()} size={20} color={getTransactionColor()} />
      </View>

      <View style={styles.details}>
        <Text style={styles.type}>{transaction.type.replace('_', ' ')}</Text>
        <Text style={styles.date}>
          {formatDate(transaction.createdAt)} • {formatTime(transaction.createdAt)}
        </Text>
      </View>

      <View style={styles.amountContainer}>
        <Text style={[styles.amount, { color: getTransactionColor() }]}>
          {getTransactionSign()}৳{transaction.amount.toFixed(2)}
        </Text>
        <View style={[
          styles.statusBadge,
          transaction.status === 'COMPLETED' ? styles.statusCompleted : 
          transaction.status === 'PENDING' ? styles.statusPending : 
          styles.statusFailed
        ]}>
          <Text style={styles.statusText}>{transaction.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  type: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusCompleted: {
    backgroundColor: COLORS.success + '20',
  },
  statusPending: {
    backgroundColor: COLORS.warning + '20',
  },
  statusFailed: {
    backgroundColor: COLORS.error + '20',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
