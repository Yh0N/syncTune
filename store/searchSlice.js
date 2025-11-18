// src/store/searchSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  results: [],
  status: "inactivo", // 'inactivo' | 'loading' | 'succeeded' | 'failed'
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setSearchLoading(state) {
      state.status = "loading";
      state.results = [];
    },
    setSearchSuccess(state, action) {
      state.status = "succeeded";
      state.results = action.payload; // array de productos
    },
    setSearchFailed(state) {
      state.status = "failed";
      state.results = [];
    },
    clearSearch(state) {
      state.status = "inactivo";
      state.results = [];
    },
  },
});

export const {
  setSearchLoading,
  setSearchSuccess,
  setSearchFailed,
  clearSearch,
} = searchSlice.actions;

export default searchSlice.reducer;
