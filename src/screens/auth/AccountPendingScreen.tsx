import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logoutUser } from '../../store/slices/authSlice';
import { COLORS } from '../../constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const AccountPendingScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [scaleAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 10,
      friction: 3,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutUser());
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Icon Animation */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}>
          <View style={styles.iconCircle}>
            <Icon name="clock-outline" size={80} color={COLORS.primary} />
          </View>
        </Animated.View>

        {/* Title */}
        <Text style={styles.title}>Profile Under Review</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Hi {user?.name || 'Agent'}, your account is currently being reviewed.
        </Text>

        {/* Information Box */}
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Icon name="check-circle" size={24} color={COLORS.success} />
            <Text style={styles.infoText}>
              Your registration was successful
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="account-clock" size={24} color={COLORS.warning} />
            <Text style={styles.infoText}>
              Admin is reviewing your information
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="email-check" size={24} color={COLORS.info} />
            <Text style={styles.infoText}>
              You'll be notified once approved
            </Text>
          </View>
        </View>

        {/* Message */}
        <View style={styles.messageBox}>
          <Text style={styles.messageTitle}>What happens next?</Text>
          <Text style={styles.messageText}>
            Our admin team is carefully reviewing your profile and submitted documents. 
            This process typically takes 24-48 hours. Once your account is approved, 
            you'll receive an email notification and gain full access to all agent features.
          </Text>
        </View>

        {/* Account Status Badge */}
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Status: {user?.isActive || 'PENDING'}</Text>
        </View>

        {/* Support Section */}
        <View style={styles.supportSection}>
          <Text style={styles.supportText}>
            Need help? Contact our support team
          </Text>
          <Text style={styles.supportEmail}>support@epay.com</Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}>
          <Icon name="logout" size={20} color={COLORS.white} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: `${COLORS.primary}30`,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  infoBox: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    marginLeft: 12,
    flex: 1,
  },
  messageBox: {
    width: '100%',
    backgroundColor: `${COLORS.info}15`,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.warning}20`,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 24,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.warning,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.warning,
    textTransform: 'uppercase',
  },
  supportSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  supportText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  supportEmail: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
