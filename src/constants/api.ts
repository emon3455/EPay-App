export const API_CONFIG = {
  BASE_URL: 'https://epay-backend.vercel.app/api/v1',
  TIMEOUT: 30000,
};

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/user/register',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh-token',
  RESET_PASSWORD: '/auth/reset-password',
  FORGOT_PASSWORD: '/auth/forgot-password',
  
  // OTP
  SEND_OTP: '/otp/send',
  VERIFY_OTP: '/otp/verify',

  // User
  GET_ALL_USERS: '/user/all-user',
  GET_ALL_AGENTS: '/user/all-agent',
  UPDATE_USER: '/user',
  APPROVE_REJECT_AGENT: '/user/agent/approve-reject',
  
  // Wallet
  GET_MY_WALLET: '/wallet/me',
  ADD_MONEY: '/wallet/add-money',
  WITHDRAW_MONEY: '/wallet/withdraw-money',
  SEND_MONEY: '/wallet/send-money',
  CASH_IN: '/wallet/cash-in',
  CASH_OUT: '/wallet/agent/withdraw-user-money', // Fixed: Use the correct endpoint
  GET_ALL_WALLETS: '/wallet/admin/all',
  BLOCK_WALLET: '/wallet/admin/block',
  
  // Transaction
  GET_MY_TRANSACTIONS: '/transaction/me',
  GET_ALL_TRANSACTIONS: '/transaction/admin/all',
  GET_AGENT_COMMISSION: '/transaction/agent/commission',
  
  // System Config
  GET_RATES: '/system-config',
};
