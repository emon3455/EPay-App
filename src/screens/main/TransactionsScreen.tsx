import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';
import { TransactionItem, Button } from '../../components';
import { COLORS } from '../../constants';
import { useAppSelector } from '../../store/hooks';
import { MainStackParamList } from '../../navigation/types';
import apiClient from '../../services/api.service';
import { Transaction } from '../../types';

type Props = NativeStackScreenProps<MainStackParamList, 'Transactions'>;

const FILTER_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Add Money', value: 'ADDMONEY' },
  { label: 'Withdraw', value: 'WITHDRAWMONEY' },
  { label: 'Send Money', value: 'SENDMONEY' },
  { label: 'Cash-In', value: 'CASHIN' },
  { label: 'Cash-Out', value: 'CASHOUT' },
];

export const TransactionsScreen: React.FC<Props> = ({ navigation }) => {
  const { wallet } = useAppSelector((state) => state.wallet);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter states
  const [selectedFilter, setSelectedFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (selectedFilter) params.type = selectedFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (debouncedSearch) params.searchTerm = debouncedSearch;
      
      const response = await apiClient.get('/transaction/me', { params });
      if (response.data.success) {
        setTransactions(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFilter, dateFrom, dateTo, debouncedSearch]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  const handleClearFilters = () => {
    setSelectedFilter('');
    setDateFrom('');
    setDateTo('');
    setSearchTerm('');
    setDebouncedSearch('');
  };

  const activeFiltersCount = [
    selectedFilter,
    dateFrom,
    dateTo,
    searchTerm,
  ].filter(Boolean).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <TouchableOpacity onPress={() => setShowFilterModal(true)}>
          <View style={styles.filterIconContainer}>
            <Icon name="filter" size={20} color={COLORS.primary} />
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Type Filter Pills */}
      <View style={styles.filters}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_OPTIONS}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedFilter === item.value && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(item.value)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === item.value && styles.filterTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <View style={styles.activeFiltersContainer}>
          <Text style={styles.activeFiltersText}>
            {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
          </Text>
          <TouchableOpacity onPress={handleClearFilters}>
            <Text style={styles.clearFiltersText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Transactions List */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TransactionItem transaction={item} />
        )}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="inbox" size={48} color={COLORS.gray300} />
            <Text style={styles.emptyText}>
              {isLoading ? 'Loading...' : 'No transactions found'}
            </Text>
          </View>
        }
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Transactions</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Icon name="x" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Date Range */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Date Range</Text>
                
                <View style={styles.dateInputContainer}>
                  <Text style={styles.inputLabel}>From</Text>
                  <View style={styles.dateInputWrapper}>
                    <Icon name="calendar" size={16} color={COLORS.gray400} style={styles.inputIcon} />
                    <TextInput
                      style={styles.dateInput}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={COLORS.gray400}
                      value={dateFrom}
                      onChangeText={setDateFrom}
                    />
                    {dateFrom && (
                      <TouchableOpacity onPress={() => setDateFrom('')}>
                        <Icon name="x-circle" size={16} color={COLORS.gray400} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <View style={styles.dateInputContainer}>
                  <Text style={styles.inputLabel}>To</Text>
                  <View style={styles.dateInputWrapper}>
                    <Icon name="calendar" size={16} color={COLORS.gray400} style={styles.inputIcon} />
                    <TextInput
                      style={styles.dateInput}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={COLORS.gray400}
                      value={dateTo}
                      onChangeText={setDateTo}
                    />
                    {dateTo && (
                      <TouchableOpacity onPress={() => setDateTo('')}>
                        <Icon name="x-circle" size={16} color={COLORS.gray400} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                
                <Text style={styles.helperText}>
                  Format: YYYY-MM-DD (e.g., 2025-10-24)
                </Text>
              </View>

              {/* Search */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Search</Text>
                <Text style={styles.filterSectionSubtitle}>
                  Search by counterparty name, email, phone, note, or reference
                </Text>
                <View style={styles.searchInputWrapper}>
                  <Icon name="search" size={18} color={COLORS.gray400} style={styles.inputIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="name, email, phone, note, reference..."
                    placeholderTextColor={COLORS.gray400}
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                  />
                  {searchTerm && (
                    <TouchableOpacity onPress={() => setSearchTerm('')}>
                      <Icon name="x-circle" size={18} color={COLORS.gray400} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <Button
                title="Clear All"
                variant="outline"
                onPress={handleClearFilters}
                style={styles.modalButton}
              />
              <Button
                title="Apply Filters"
                onPress={() => setShowFilterModal(false)}
                style={styles.modalButton}
              />
            </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  filterIconContainer: {
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  filters: {
    marginBottom: 8,
  },
  filtersList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.white,
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: COLORS.primary + '10',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 8,
  },
  activeFiltersText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  clearFiltersText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
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
  modalBody: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  filterSectionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  dateInputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  dateInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 44,
  },
  inputIcon: {
    marginRight: 8,
  },
  dateInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },
  helperText: {
    fontSize: 11,
    color: COLORS.gray400,
    marginTop: 4,
    fontStyle: 'italic',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalButton: {
    flex: 1,
  },
});
