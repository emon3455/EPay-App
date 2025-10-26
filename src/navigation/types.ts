export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  VerifyOTP: { email: string };
  ForgotPassword: undefined;
};

export type MainStackParamList = {
  Home: undefined;
  Profile: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  SendMoney: undefined;
  AddMoney: undefined;
  WithdrawMoney: undefined;
  Transactions: undefined;
  // Agent screens
  CashIn: undefined;
  CashOut: undefined;
  AgentCommission: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};
