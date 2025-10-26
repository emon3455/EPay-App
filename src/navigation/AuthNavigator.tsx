import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { 
  LoginScreen, 
  RegisterScreen, 
  VerifyOTPScreen,
  ForgotPasswordScreen
} from '../screens/auth';
import { AuthStackParamList } from './types';
import { useAppSelector } from '../store/hooks';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  // Determine initial route based on user verification status
  const initialRouteName: keyof AuthStackParamList = 
    user && user.isVerified === false && user.email ? 'VerifyOTP' : 'Login';

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
    </Stack.Navigator>
  );
};
