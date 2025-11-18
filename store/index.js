// src/store/index.js
import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./authSlice.js";
import playerReducer from "./playerSlice.js";
import searchReducer from "./searchSlice.js";
import roomReducer from "./roomSlice.js";
import notificationsReducer from "./notificationsSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    player: playerReducer,
    search: searchReducer,
    room: roomReducer,
    notifications: notificationsReducer,
  },
});
