import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { WalletState, Wallet, Transaction, AddMoneyData, WithdrawMoneyData, SendMoneyData } from '../../types';
import { WalletService, TransactionService } from '../../services';

const initialState: WalletState = {
  wallet: null,
  transactions: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchWallet = createAsyncThunk(
  'wallet/fetchWallet',
  async (_, { rejectWithValue }) => {
    try {
      const wallet = await WalletService.getMyWallet();
      return wallet;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch wallet'
      );
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  'wallet/fetchTransactions',
  async (_, { rejectWithValue }) => {
    try {
      const transactions = await TransactionService.getMyTransactions();
      return transactions;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch transactions'
      );
    }
  }
);

export const addMoney = createAsyncThunk(
  'wallet/addMoney',
  async (data: AddMoneyData, { rejectWithValue, dispatch }) => {
    try {
      const response = await WalletService.addMoney(data);
      // Refresh wallet after successful transaction
      dispatch(fetchWallet());
      dispatch(fetchTransactions());
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add money'
      );
    }
  }
);

export const withdrawMoney = createAsyncThunk(
  'wallet/withdrawMoney',
  async (data: WithdrawMoneyData, { rejectWithValue, dispatch }) => {
    try {
      const response = await WalletService.withdrawMoney(data);
      dispatch(fetchWallet());
      dispatch(fetchTransactions());
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to withdraw money'
      );
    }
  }
);

export const sendMoney = createAsyncThunk(
  'wallet/sendMoney',
  async (data: SendMoneyData, { rejectWithValue, dispatch }) => {
    try {
      const response = await WalletService.sendMoney(data);
      dispatch(fetchWallet());
      dispatch(fetchTransactions());
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to send money'
      );
    }
  }
);

// Slice
const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearWallet: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Fetch Wallet
    builder
      .addCase(fetchWallet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wallet = action.payload;
      })
      .addCase(fetchWallet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Transactions
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add Money
    builder
      .addCase(addMoney.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addMoney.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(addMoney.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Withdraw Money
    builder
      .addCase(withdrawMoney.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(withdrawMoney.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(withdrawMoney.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Send Money
    builder
      .addCase(sendMoney.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMoney.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(sendMoney.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearWallet } = walletSlice.actions;
export default walletSlice.reducer;
