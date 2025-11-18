// src/ui/Player/renderMySongs.js
// ---------------------------------------------------------------------------
// Renderiza la lista de canciones LOCALES agregadas por el usuario.
//
// Estas canciones se guardan en:
//   state.player.localSongs
//
// Cada vez que cambia el store → se vuelve a pintar la lista.
//
// Funcionalidades:
//   Mostrar canciones guardadas localmente
//   Reproducir una canción al hacer clic
// ---------------------------------------------------------------------------

import { store } from "../../store/index.js";
import { setSong, playSong } from "../../store/playerSlice.js";

export default function renderMySongs() {
  const list = document.getElementById("my-songs-list");

  // Escuchamos cualquier cambio del store (Redux)
  store.subscribe(() => {
    const state = store.getState().player;
    const songs = state.localSongs;

    // Limpiamos lista antes de repintar
    list.innerHTML = "";

    songs.forEach((song) => {
      const li = document.createElement("li");

      // Nombre de la canción
      li.textContent = song.title;
      li.style.padding = "6px";
      li.style.cursor = "pointer";

      // Al hacer clic, reproducimos la canción local
      li.addEventListener("click", () => {
        store.dispatch(setSong(song));
        store.dispatch(playSong(song));
      });

      list.appendChild(li);
    });
  });
}
