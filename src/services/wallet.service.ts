import apiClient from './api.service';
import { API_ENDPOINTS } from '../constants';
import {
  Wallet,
  Transaction,
  AddMoneyData,
  WithdrawMoneyData,
  SendMoneyData,
  CashInData,
  CashOutData,
} from '../types';

export const WalletService = {
  /**
   * Get current user's wallet
   */
  async getMyWallet(): Promise<Wallet> {
    const response = await apiClient.get<{ success: boolean; data: Wallet }>(
      API_ENDPOINTS.GET_MY_WALLET
    );
    return response.data.data;
  },

  /**
   * Add money to wallet
   */
  async addMoney(data: AddMoneyData): Promise<any> {
    const response = await apiClient.post(API_ENDPOINTS.ADD_MONEY, data);
    return response.data;
  },

  /**
   * Withdraw money from wallet
   */
  async withdrawMoney(data: WithdrawMoneyData): Promise<any> {
    const response = await apiClient.post(API_ENDPOINTS.WITHDRAW_MONEY, data);
    return response.data;
  },

  /**
   * Send money to another user
   */
  async sendMoney(data: SendMoneyData): Promise<any> {
    const response = await apiClient.post(API_ENDPOINTS.SEND_MONEY, data);
    return response.data;
  },

  /**
   * Agent: Cash-in to user
   */
  async cashIn(data: CashInData): Promise<any> {
    const response = await apiClient.post(API_ENDPOINTS.CASH_IN, data);
    return response.data;
  },

  /**
   * Agent: Cash-out from user
   */
  async cashOut(data: CashOutData): Promise<any> {
    const response = await apiClient.post(API_ENDPOINTS.CASH_OUT, data);
    return response.data;
  },
};

export const TransactionService = {
  /**
   * Get user's transaction history
   */
  async getMyTransactions(): Promise<Transaction[]> {
    const response = await apiClient.get<{ success: boolean; data: Transaction[] }>(
      API_ENDPOINTS.GET_MY_TRANSACTIONS
    );
    return response.data.data;
  },

  /**
   * Get agent commission
   */
  async getAgentCommission(agentId: string): Promise<any> {
    const response = await apiClient.get(
      `${API_ENDPOINTS.GET_AGENT_COMMISSION}/${agentId}`
    );
    return response.data;
  },
};
