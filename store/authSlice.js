// src/store/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  status: "inactivo", // 'inactivo' | 'loading' | 'succeeded' | 'failed'
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoginLoading(state) {
      state.status = "loading";
    },
    setLoginSuccess(state, action) {
      state.status = "succeeded";
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    setLoginFailed(state) {
      state.status = "failed";
      state.token = null;
      state.user = null;
    },
    setLogout(state) {
      state.status = "inactivo";
      state.token = null;
      state.user = null;
    },
  },
});

// Exportar las acciones
export const {
  setLoginLoading,
  setLoginSuccess,
  setLoginFailed,
  setLogout,
} = authSlice.actions;

// Exportar el reducer
export default authSlice.reducer;
