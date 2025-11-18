// notificationsSlice.js
// ---------------------------------------------------------------------------
// Slice que administra todas las NOTIFICACIONES de la aplicación.
//
// - Cada notificación es un objeto generado por NotificationFactory
// - Se almacenan en un array
// - El panel visual las consume y muestra
// ---------------------------------------------------------------------------

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notifications: [], // Lista de notificaciones activas
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // Agrega una notificación al arreglo
    // (Ya viene formateada desde NotificationFactory)
    addNotification(state, action) {
      state.notifications.push(action.payload);
    },

    // Elimina una notificación según su ID
    removeNotification(state, action) {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },

    // Limpia TODAS las notificaciones
    clearNotifications(state) {
      state.notifications = [];
    },
  },
});

// Exportamos las acciones para que WorkerFacade y otros módulos las usen
export const {
  addNotification,
  removeNotification,
  clearNotifications,
} = notificationsSlice.actions;

// Exportar el reducer para incluirlo en store/index.js
export default notificationsSlice.reducer;
