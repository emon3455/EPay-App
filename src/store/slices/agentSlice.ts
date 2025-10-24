import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CashInData, CashOutData } from '../../types';
import { WalletService, TransactionService } from '../../services';

interface AgentState {
  commission: any;
  isLoading: boolean;
  error: string | null;
}

const initialState: AgentState = {
  commission: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const cashIn = createAsyncThunk(
  'agent/cashIn',
  async (data: CashInData, { rejectWithValue, dispatch }) => {
    try {
      const response = await WalletService.cashIn(data);
      // Refresh wallet after successful transaction
      const { fetchWallet, fetchTransactions } = await import('./walletSlice');
      dispatch(fetchWallet());
      dispatch(fetchTransactions());
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Cash-in failed'
      );
    }
  }
);

export const cashOut = createAsyncThunk(
  'agent/cashOut',
  async (data: CashOutData, { rejectWithValue, dispatch }) => {
    try {
      const response = await WalletService.cashOut(data);
      const { fetchWallet, fetchTransactions } = await import('./walletSlice');
      dispatch(fetchWallet());
      dispatch(fetchTransactions());
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Cash-out failed'
      );
    }
  }
);

export const fetchCommission = createAsyncThunk(
  'agent/fetchCommission',
  async (agentId: string, { rejectWithValue }) => {
    try {
      const commission = await TransactionService.getAgentCommission(agentId);
      return commission;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch commission'
      );
    }
  }
);

// Slice
const agentSlice = createSlice({
  name: 'agent',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Cash In
    builder
      .addCase(cashIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cashIn.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(cashIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Cash Out
    builder
      .addCase(cashOut.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cashOut.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(cashOut.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Commission
    builder
      .addCase(fetchCommission.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCommission.fulfilled, (state, action) => {
        state.isLoading = false;
        state.commission = action.payload;
      })
      .addCase(fetchCommission.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = agentSlice.actions;
export default agentSlice.reducer;
