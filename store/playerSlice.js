// playerSlice.js
// ---------------------------------------------------------------------------
// Slice encargado de manejar TODO el estado del reproductor.
//
// Controla:
//   ✓ Canción actual
//   ✓ Estado de reproducción (play/pause)
//   ✓ Cola de reproducción
//   ✓ Estrategia de reproducción (LINEAR / SHUFFLE / LOOP)
//   ✓ Canciones locales cargadas por el usuario
// ---------------------------------------------------------------------------

import { createSlice } from "@reduxjs/toolkit";

// Estado inicial del reproductor
const initialState = {
  currentSong: null,   // Objeto canción actualmente seleccionada
  isPlaying: false,    // true = sonando | false = pausado

  queue: [],           // Lista de canciones a reproducir
  strategy: "LINEAR",  // Estrategia actual del reproductor

  // Canciones subidas por el propio usuario desde su PC
  localSongs: [],
};

const playerSlice = createSlice({
  name: "player",
  initialState,

  reducers: {
    // --------------------------------------------------
    // 🎵 Manejo de la cola de reproducción
    // --------------------------------------------------
    setQueue(state, action) {
      state.queue = action.payload; // Reemplaza toda la cola
    },

    addToQueue(state, action) {
      state.queue.push(action.payload); // Agrega una canción al final
    },

    // --------------------------------------------------
    // 🎧 Manejo de la canción actual
    // --------------------------------------------------
    setSong(state, action) {
      state.currentSong = action.payload; // Se cambia la canción actual
      state.isPlaying = false;            // Se detiene hasta que se le dé play
    },

    playSong(state, action) {
      // Si llega una canción → la actualizamos
      state.currentSong = action.payload || state.currentSong;

      // Si existe canción, empezamos a reproducir
      if (state.currentSong) state.isPlaying = true;
    },

    pauseSong(state) {
      state.isPlaying = false; // Solo pausa, no cambia la canción
    },

    nextSong(state, action) {
      state.currentSong = action.payload; // Estrategia decide cuál sigue
      state.isPlaying = true;
    },

    previousSong(state, action) {
      state.currentSong = action.payload;
      state.isPlaying = true;
    },

    // --------------------------------------------------
    // 🔄 Estrategia (LINEAR / SHUFFLE / LOOP)
    // --------------------------------------------------
    setStrategy(state, action) {
      state.strategy = action.payload;
    },

    // --------------------------------------------------
    // 📁 Canciones locales ("Mis canciones")
    // --------------------------------------------------
    addLocalSong(state, action) {
      state.localSongs.push(action.payload); // Guardamos canción local
    }
  },
});

// Exportamos todas las acciones
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

// Export del reducer
export default playerSlice.reducer;
