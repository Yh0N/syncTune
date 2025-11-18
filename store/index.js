// store/index.js
// ---------------------------------------------------------------------------
// Archivo principal donde configuramos el store de Redux Toolkit.
//
// Aquí unimos TODOS los slices de la aplicación en un solo estado global.
// ---------------------------------------------------------------------------

import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./authSlice.js";
import playerReducer from "./playerSlice.js";
import searchReducer from "./searchSlice.js";
import roomReducer from "./roomSlice.js";
import notificationsReducer from "./notificationsSlice.js";

// Configuración del store global
// Cada slice controla una parte del estado total
export const store = configureStore({
  reducer: {
    auth: authReducer,               // Login / logout
    player: playerReducer,           // Reproductor de música
    search: searchReducer,           // Resultados de búsqueda
    room: roomReducer,               // Sala de escucha (modo host/guest)
    notifications: notificationsReducer, // Notificaciones globales
  },
});
