export interface Wallet {
  _id: string;
  user: string;
  balance: number;
  isActive: 'ACTIVE' | 'BLOCKED';
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  type: 'ADDMONEY' | 'WITHDRAWMONEY' | 'SENDMONEY' | 'CASHIN' | 'CASHOUT';
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
  agent?: {
    _id: string;
    name: string;
    email: string;
  };
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  commission?: number;
  fee?: number;
  note?: string;
  reference?: string;
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
