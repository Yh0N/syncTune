// roomSlice.js
// ---------------------------------------------------------------------------
// Slice encargado del estado de la SALA DE ESCUCHA.
// Esta sala es simulada por un Web Worker (syncRoom.worker.js)
//
// Controla:
//   ✓ Invitados conectados
//   ✓ Estado de reproducción del host (PLAYING / PAUSED / ACTIVE)
//   ✓ Canción actual seleccionada por el host
// ---------------------------------------------------------------------------

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  guests: [],              // Lista de invitados (simulados por el worker)
  playbackStatus: "PAUSED", // Estados posibles: PLAYING / PAUSED / ACTIVE
  currentSongId: null,      // ID de la canción que el host cambió
};

const roomSlice = createSlice({
  name: "room",
  initialState,

  reducers: {
    // Cuando un invitado entra a la sala
    joinGuest(state, action) {
      state.guests.push(action.payload);
    },

    // El host cambia la canción → worker envía songId
    setRoomSong(state, action) {
      state.currentSongId = action.payload;
    },

    // El host hace PLAY, PAUSE o activa la sala
    setRoomPlaybackStatus(state, action) {
      state.playbackStatus = action.payload;
    },

    // Reiniciar la sala (si el host la cierra)
    resetRoom(state) {
      state.guests = [];
      state.playbackStatus = "PAUSED";
      state.currentSongId = null;
    },
  },
});

// Exportar acciones
export const {
  joinGuest,
  setRoomSong,
  setRoomPlaybackStatus,
  resetRoom,
} = roomSlice.actions;

// Exportar reducer
export default roomSlice.reducer;
