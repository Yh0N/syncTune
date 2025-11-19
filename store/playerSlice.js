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
// → Importa la función que permite crear slices de Redux Toolkit

// ---------------------------------------------------------------------------
// ESTADO INICIAL DEL REPRODUCTOR
// ---------------------------------------------------------------------------
const initialState = {
  currentSong: null,   // Objeto canción actualmente seleccionada
  isPlaying: false,    // true: sonando — false: pausado

  queue: [],           // Cola completa de canciones cargadas
  strategy: "LINEAR",  // Estrategia actual (Linear / Shuffle / Loop)

  localSongs: [],      // Canciones subidas localmente desde el PC
};

// ---------------------------------------------------------------------------
// DEFINICIÓN DEL SLICE "player"
// Aquí se crean:
//   ✓ el estado
//   ✓ los reducers (funciones que modifican el estado)
//   ✓ las actions correspondientes
// ---------------------------------------------------------------------------
const playerSlice = createSlice({
  name: "player",        // Nombre del slice
  initialState,          // Estado inicial

  reducers: {
    // --------------------------------------------------
    // 🎵 MANEJO DE LA COLA DE REPRODUCCIÓN
    // --------------------------------------------------

    setQueue(state, action) {
      // Reemplaza toda la cola con un nuevo array de canciones
      state.queue = action.payload;
    },

    addToQueue(state, action) {
      // Agrega una canción al final de la cola existente
      state.queue.push(action.payload);
    },

    // --------------------------------------------------
    // 🎧 MANEJO DE LA CANCIÓN ACTUAL
    // --------------------------------------------------

    setSong(state, action) {
      // Cambia la canción actual por una nueva
      state.currentSong = action.payload;

      // Cada vez que se selecciona una canción, comienza en pausa
      state.isPlaying = false;
    },

    playSong(state, action) {
      // Si playSong recibe una canción → la actualizamos como actual
      state.currentSong = action.payload || state.currentSong;

      // Si existe canción, ponemos estado "reproduciendo"
      if (state.currentSong) state.isPlaying = true;
    },

    pauseSong(state) {
      // Solo pausa la canción actual, sin modificarla
      state.isPlaying = false;
    },

    nextSong(state, action) {
      // Recibe la canción siguiente (calculada por la Strategy)
      state.currentSong = action.payload;
      state.isPlaying = true; // Automáticamente la reproduce
    },

    previousSong(state, action) {
      // Igual que nextSong pero hacia atrás
      state.currentSong = action.payload;
      state.isPlaying = true;
    },

    // --------------------------------------------------
    // 🔄 MANEJO DE LA ESTRATEGIA DE REPRODUCCIÓN
    // LINEAR / SHUFFLE / LOOP
    // --------------------------------------------------
    setStrategy(state, action) {
      // Cambia el modo de reproducción actual
      state.strategy = action.payload;
    },

    // --------------------------------------------------
    // 📁 CANCIONES LOCALES
    // Guardadas por el usuario desde su PC
    // --------------------------------------------------
    addLocalSong(state, action) {
      // Agrega la canción local al array "localSongs"
      state.localSongs.push(action.payload);
    }
  },
});

// ---------------------------------------------------------------------------
// Exportamos TODAS las acciones generadas automáticamente por createSlice()
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Exportamos el reducer final para que el store lo pueda usar
// ---------------------------------------------------------------------------
export default playerSlice.reducer;
