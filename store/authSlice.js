// authSlice.js
// ---------------------------------------------------------------------------
// Slice encargado de manejar el estado de AUTENTICACIÓN del usuario.
// Administra:
//   - usuario logueado
//   - token de sesión
//   - estado del proceso (loading, error, éxito)
// ---------------------------------------------------------------------------

import { createSlice } from "@reduxjs/toolkit";

// Estado inicial del módulo de autenticación
const initialState = {
  user: null,            // Datos del usuario autenticado
  token: null,           // Token devuelto por FakeStoreAPI
  status: "inactivo",    // Estado del login ('loading', 'succeeded', 'failed')
};

// Se crea el slice con sus reducers
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Cuando comienza el login → activamos estado "loading"
    setLoginLoading(state) {
      state.status = "loading";
    },

    // Login exitoso → guardamos token y usuario
    setLoginSuccess(state, action) {
      state.status = "succeeded";
      state.token = action.payload.token;
      state.user = action.payload.user;
    },

    // Login fallido → borramos datos
    setLoginFailed(state) {
      state.status = "failed";
      state.token = null;
      state.user = null;
    },

    // Logout → limpiamos todo
    setLogout(state) {
      state.status = "inactivo";
      state.token = null;
      state.user = null;
    },
  },
});

// Exportar acciones para que apiService las use
export const {
  setLoginLoading,
  setLoginSuccess,
  setLoginFailed,
  setLogout,
} = authSlice.actions;

// Exportar reducer para que store/index.js lo agregue al store global
export default authSlice.reducer;
