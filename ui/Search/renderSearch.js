// src/ui/Search/renderSearch.js

import { store } from "/src/store/index.js";
import { setQueue, setSong, playSong } from "/src/store/playerSlice.js";
import musicService from "/src/services/musicService.js";
import { addNotification } from "/src/store/notificationsSlice.js";

export default function renderSearch() {
  const input = document.getElementById("search-input");
  const searchBtn = document.getElementById("search-btn");
  const list = document.getElementById("search-results");

  const topBtn = document.getElementById("top-songs-btn");
  const rockBtn = document.getElementById("rock-btn");
  const randomBtn = document.getElementById("random-btn");

  // 📌 Función para pintar canciones en pantalla
  function renderSongs(results) {
    list.innerHTML = "";

    if (!results.length) {
      list.innerHTML = "<li>No se encontraron canciones ❌</li>";
      return;
    }

    results.forEach((song) => {
      const li = document.createElement("li");
      li.style.cursor = "pointer";

      li.innerHTML = `
        <img src="${song.cover}" width="50" />
        <strong>${song.title}</strong><br>
        <small>${song.artist}</small>
      `;

      li.addEventListener("click", () => {
        store.dispatch(setSong(song));
        store.dispatch(playSong(song));
      });

      list.appendChild(li);
    });

    store.dispatch(
      addNotification({
        type: "success",
        message: `${results.length} canciones cargadas 🎵`,
      })
    );
  }

  // 🔍 Búsqueda normal
  searchBtn.addEventListener("click", async () => {
    const term = input.value.trim();
    if (!term) return;

    const results = await musicService.searchSongs(term);
    store.dispatch(setQueue(results));
    renderSongs(results);
  });

  // ⭐ TOP CANCIONES
  topBtn.addEventListener("click", async () => {
    const results = await musicService.getTopSongs();
    store.dispatch(setQueue(results));
    renderSongs(results);
  });

  // 🤘 ROCK
  rockBtn.addEventListener("click", async () => {
    const results = await musicService.getByGenre("rock");
    store.dispatch(setQueue(results));
    renderSongs(results);
  });

  // 🎲 ALEATORIO
  randomBtn.addEventListener("click", async () => {
    const results = await musicService.getRandomSongs();
    store.dispatch(setQueue(results));
    renderSongs(results);
  });
}
