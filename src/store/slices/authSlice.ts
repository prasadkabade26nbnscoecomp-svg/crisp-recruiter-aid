import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  userType: 'admin' | 'candidate' | null;
  candidatePhone?: string;
}

const initialState: AuthState = {
  isAuthenticated: false,
  userType: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginAdmin: (state) => {
      state.isAuthenticated = true;
      state.userType = 'admin';
    },
    loginCandidate: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = true;
      state.userType = 'candidate';
      state.candidatePhone = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.userType = null;
      state.candidatePhone = undefined;
    },
  },
});

export const { loginAdmin, loginCandidate, logout } = authSlice.actions;
export default authSlice.reducer;