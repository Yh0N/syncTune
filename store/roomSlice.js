import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  guests: [],             // Lista de invitados en la sala
  playbackStatus: "PAUSED", // PLAYING / PAUSED / ACTIVE
  currentSongId: null,      // Canción que el host envió
};

const roomSlice = createSlice({
  name: "room",
  initialState,

  reducers: {
    // INVITADO ENTRA
    joinGuest(state, action) {
      state.guests.push(action.payload); 
    },

    // HOST CAMBIA CANCIÓN
    setRoomSong(state, action) {
      state.currentSongId = action.payload;
    },

    // PLAY / PAUSE / ACTIVE
    setRoomPlaybackStatus(state, action) {
      state.playbackStatus = action.payload;
    },

    // SI QUIERES LIMPIAR SALA
    resetRoom(state) {
      state.guests = [];
      state.playbackStatus = "PAUSED";
      state.currentSongId = null;
    },
  },
});

// EXPORTACIONES NECESARIAS
export const {
  joinGuest,
  setRoomSong,
  setRoomPlaybackStatus,
  resetRoom,
} = roomSlice.actions;

export default roomSlice.reducer;
