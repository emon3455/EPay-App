import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  HomeScreen,
  SendMoneyScreen,
  AddMoneyScreen,
  WithdrawMoneyScreen,
  TransactionsScreen,
  ProfileScreen,
  EditProfileScreen,
  ChangePasswordScreen,
  CashInScreen,
  CashOutScreen,
  AgentCommissionScreen,
} from '../screens';
import { MainStackParamList } from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="SendMoney" component={SendMoneyScreen} />
      <Stack.Screen name="AddMoney" component={AddMoneyScreen} />
      <Stack.Screen name="WithdrawMoney" component={WithdrawMoneyScreen} />
      <Stack.Screen name="Transactions" component={TransactionsScreen} />
      {/* Agent Screens */}
      <Stack.Screen name="CashIn" component={CashInScreen} />
      <Stack.Screen name="CashOut" component={CashOutScreen} />
      <Stack.Screen name="AgentCommission" component={AgentCommissionScreen} />
    </Stack.Navigator>
  );
};
