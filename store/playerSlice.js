import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentSong: null,
  isPlaying: false,
  queue: [],          // Cola de reproducción
  strategy: "LINEAR",

  // 🎵 Lista fija de canciones agregadas por el usuario
  localSongs: [],
};

const playerSlice = createSlice({
  name: "player",
  initialState,

  reducers: {
    // -----------------------------
    // 🎵 Cola de reproducción
    // -----------------------------
    setQueue(state, action) {
      state.queue = action.payload;
    },

    addToQueue(state, action) {
      state.queue.push(action.payload);
    },

    // -----------------------------
    // 🎵 Canción actual
    // -----------------------------
    setSong(state, action) {
      state.currentSong = action.payload;
      state.isPlaying = false;
    },

    playSong(state, action) {
      state.currentSong = action.payload || state.currentSong;
      if (state.currentSong) state.isPlaying = true;
    },

    pauseSong(state) {
      state.isPlaying = false;
    },

    nextSong(state, action) {
      state.currentSong = action.payload;
      state.isPlaying = true;
    },

    previousSong(state, action) {
      state.currentSong = action.payload;
      state.isPlaying = true;
    },

    setStrategy(state, action) {
      state.strategy = action.payload;
    },

    // -----------------------------
    // 🎵 Lista FIJA — Mis Canciones
    // -----------------------------
    addLocalSong(state, action) {
      state.localSongs.push(action.payload);
    }
  },
});

// -----------------------------
// EXPORTS CORRECTOS
// -----------------------------
export const {
  setQueue,
  addToQueue,
  setSong,
  playSong,
  pauseSong,
  nextSong,
  previousSong,
  setStrategy,
  addLocalSong,
} = playerSlice.actions;

export default playerSlice.reducer;
