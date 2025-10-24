import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';
import { Button } from '../../components';
import { COLORS } from '../../constants';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logoutUser } from '../../store/slices/authSlice';
import { fetchWallet } from '../../store/slices/walletSlice';
import { MainStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'Profile'>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { wallet } = useAppSelector((state) => state.wallet);

  useEffect(() => {
    // Fetch wallet data when profile screen loads
    dispatch(fetchWallet());
  }, [dispatch]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => dispatch(logoutUser()),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Icon
            name="arrow-left"
            size={24}
            color={COLORS.textPrimary}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Profile Info */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role}</Text>
          </View>
        </View>

        {/* Account Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          {/* Account Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusIconContainer}>
              <Icon name="shield" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.statusContent}>
              <Text style={styles.statusLabel}>Account Status</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: user?.isActive === 'ACTIVE' ? COLORS.success + '20' : COLORS.warning + '20' }
              ]}>
                <Text style={[
                  styles.statusValue,
                  { color: user?.isActive === 'ACTIVE' ? COLORS.success : COLORS.warning }
                ]}>
                  {user?.isActive || 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          {/* Wallet Status Card */}
          {wallet && (
            <View style={styles.statusCard}>
              <View style={styles.statusIconContainer}>
                <Icon name="credit-card" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.statusContent}>
                <Text style={styles.statusLabel}>Wallet Status</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: wallet.isActive === 'ACTIVE' ? COLORS.success + '20' : COLORS.error + '20' }
                ]}>
                  <Text style={[
                    styles.statusValue,
                    { color: wallet.isActive === 'ACTIVE' ? COLORS.success : COLORS.error }
                  ]}>
                    {wallet.isActive}
                  </Text>
                </View>
              </View>
            </View>
          )}
          
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <Icon name="phone" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              <Text style={styles.infoValue}>{user?.phone || 'Not provided'}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <Icon name="calendar" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>
                {new Date(user?.createdAt || '').toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Icon name="edit" size={20} color={COLORS.textPrimary} />
            <Text style={styles.actionText}>Edit Profile</Text>
            <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <Icon name="lock" size={20} color={COLORS.textPrimary} />
            <Text style={styles.actionText}>Change Password</Text>
            <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <Icon name="settings" size={20} color={COLORS.textPrimary} />
            <Text style={styles.actionText}>Settings</Text>
            <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <Icon name="help-circle" size={20} color={COLORS.textPrimary} />
            <Text style={styles.actionText}>Help & Support</Text>
            <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutButton}
        />
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: COLORS.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: COLORS.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statusIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  statusContent: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusValue: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 12,
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 24,
  },
});
