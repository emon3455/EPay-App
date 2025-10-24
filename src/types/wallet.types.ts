export interface Wallet {
  _id: string;
  user: string;
  balance: number;
  status: 'ACTIVE' | 'BLOCKED';
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  type: 'ADD_MONEY' | 'WITHDRAW' | 'SEND_MONEY' | 'CASH_IN' | 'CASH_OUT';
  amount: number;
  sender?: {
    _id: string;
    name: string;
    email: string;
  };
  receiver?: {
    _id: string;
    name: string;
    email: string;
  };
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  commission?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddMoneyData {
  amount: number;
  method?: string;
}

export interface WithdrawMoneyData {
  amount: number;
  agentId: string;
}

export interface SendMoneyData {
  receiverEmail?: string;
  receiverEmailOrPhone?: string;
  amount: number;
  pin?: string;
}

export interface CashInData {
  userEmail: string;
  amount: number;
}

export interface CashOutData {
  userEmail: string;
  amount: number;
}

export interface WalletState {
  wallet: Wallet | null;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}
