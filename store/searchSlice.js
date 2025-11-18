// searchSlice.js
// ---------------------------------------------------------------------------
// Slice encargado del estado de BÚSQUEDA de canciones.
// Este slice es alimentado por el Search Worker (search.worker.js)
//
// Controla:
//   ✓ Resultados de búsqueda
//   ✓ Estado de la búsqueda: loading / error / completada
// ---------------------------------------------------------------------------

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  results: [],            // Lista de canciones encontradas
  status: "inactivo",     // Estado del proceso
};

const searchSlice = createSlice({
  name: "search",
  initialState,

  reducers: {
    // Cuando comienza la búsqueda → limpiamos resultados
    setSearchLoading(state) {
      state.status = "loading";
      state.results = [];
    },

    // Éxito → guardamos las canciones recibidas
    setSearchSuccess(state, action) {
      state.status = "succeeded";
      state.results = action.payload;
    },

    // Error → limpiamos y marcamos estado
    setSearchFailed(state) {
      state.status = "failed";
      state.results = [];
    },

    // Restablece el módulo de búsqueda
    clearSearch(state) {
      state.status = "inactivo";
      state.results = [];
    },
  },
});

// Exportamos acciones
export const {
  setSearchLoading,
  setSearchSuccess,
  setSearchFailed,
  clearSearch,
} = searchSlice.actions;

// Reducer final
export default searchSlice.reducer;
