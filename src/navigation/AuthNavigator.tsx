import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { 
  LoginScreen, 
  RegisterScreen, 
  VerifyOTPScreen,
  ForgotPasswordScreen,
  AccountPendingScreen
} from '../screens/auth';
import { AuthStackParamList } from './types';
import { useAppSelector } from '../store/hooks';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  // Determine initial route based on user verification and active status
  const getInitialRoute = (): keyof AuthStackParamList => {
    if (user) {
      // If user is an agent with pending status, show AccountPending screen
      if (user.isActive === 'PENDING' && user.role === 'AGENT') {
        return 'AccountPending';
      }
      // If user is not verified, show OTP screen
      if (user.isVerified === false && user.email) {
        return 'VerifyOTP';
      }
    }
    return 'Login';
  };

  const initialRouteName = getInitialRoute();

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen 
        name="VerifyOTP" 
        component={VerifyOTPScreen}
        initialParams={user?.email ? { email: user.email } : undefined}
      />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="AccountPending" component={AccountPendingScreen} />
    </Stack.Navigator>
  );
};
