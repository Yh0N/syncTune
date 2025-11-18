// renderPlayer.js
// -----------------------------------------------------------------------------
// Este archivo controla TODO el reproductor de música:
// botones, audio HTML, estrategias de reproducción, workers y Redux.

// ⭐ Dentro de este archivo se usa el Patrón STRATEGY (Linear / Loop / Shuffle)
//   para decidir cómo avanza la música (NEXT / PREVIOUS).
// -----------------------------------------------------------------------------

import {
  playSong,
  pauseSong,
  nextSong,
  previousSong,
  setStrategy,
  addToQueue,
  setSong,
  addLocalSong,
} from "/src/store/playerSlice.js";

import { store } from "/src/store/index.js";
import { strategies } from "/src/patterns/strategy/strategyMap.js";
import WorkerFacade from "/src/services/workerFacade.js";
import { addNotification } from "/src/store/notificationsSlice.js";
import NotificationFactory from "/src/patterns/factory/NotificationFactory.js";

// Facade → conexión UI ↔ Workers
const facade = new WorkerFacade(store);

export default function renderPlayer(store, facade) {
  // ---------------------------------------------------------------------------
  // 🔘 Referencias UI
  // ---------------------------------------------------------------------------
  const playBtn = document.getElementById("play-btn");
  const pauseBtn = document.getElementById("pause-btn");
  const nextBtn = document.getElementById("next-btn");
  const prevBtn = document.getElementById("prev-btn");
  const strategySelect = document.getElementById("strategy-select");
  const currentSongText = document.getElementById("current-song");

  const inputLocal = document.getElementById("local-music-input");
  const btnAddLocal = document.getElementById("add-local-music-btn");

  const exportCsvBtn = document.getElementById("export-csv-btn");
  const exportJsonBtn = document.getElementById("export-json-btn");

  const mySongsList = document.getElementById("my-songs-list");

  // Reproductor real del navegador
  const audio = new Audio();

  // ---------------------------------------------------------------------------
  // ▶ CUANDO UNA CANCIÓN TERMINA → usar estrategia actual (Strategy Pattern)
  // ---------------------------------------------------------------------------
  audio.addEventListener("ended", () => {
    const state = store.getState().player;
    const strategy = strategies[state.strategy]; // LINEAR / SHUFFLE / LOOP

    const nextSongData = strategy.getNextSong(state.currentSong, state.queue);

    if (nextSongData) {
      store.dispatch(nextSong(nextSongData));
      facade.hostChangeSong(nextSongData.id);
    }
  });

  // ---------------------------------------------------------------------------
  // 🎵 Render listar música local
  // ---------------------------------------------------------------------------
  function renderMySongs() {
    const localSongs = store.getState().player.localSongs;
    mySongsList.innerHTML = "";

    localSongs.forEach((song) => {
      const li = document.createElement("li");
      li.textContent = "🎵 " + song.title;
      li.style.cursor = "pointer";

      li.addEventListener("click", () => {
        store.dispatch(setSong(song));
        store.dispatch(playSong(song));
      });

      mySongsList.appendChild(li);
    });
  }

  // ---------------------------------------------------------------------------
  // 🎧 Suscripción global al store → refrescar UI
  // ---------------------------------------------------------------------------
  store.subscribe(() => {
    const state = store.getState().player;

    renderMySongs();

    const song = state.currentSong;

    if (!song) {
      currentSongText.textContent = "🎵 Ninguna canción seleccionada";
      audio.pause();
      return;
    }

    currentSongText.textContent = `🎵 ${song.title} ${
      state.isPlaying ? "▶️" : "⏸️"
    }`;

    if (audio.src !== song.preview) {
      audio.src = song.preview;
      audio.load();
    }

    if (state.isPlaying) audio.play().catch(() => {});
    else audio.pause();
  });

  // ---------------------------------------------------------------------------
  // 🎵 Subir música local
  // ---------------------------------------------------------------------------
  btnAddLocal.addEventListener("click", () => {
    const file = inputLocal.files[0];
    if (!file) return alert("Selecciona un archivo MP3");

    const url = URL.createObjectURL(file);

    const song = {
      id: Date.now(),
      title: file.name.replace(/\.[^/.]+$/, ""),
      preview: url,
      local: true,
    };

    store.dispatch(addLocalSong(song));
    store.dispatch(addToQueue(song));
    store.dispatch(setSong(song));
    store.dispatch(playSong(song));

    store.dispatch(
      addNotification(
        NotificationFactory.create("HOST_CHANGED_SONG", {
          title: song.title,
        })
      )
    );
  });

  // ---------------------------------------------------------------------------
  // ▶ PLAY
  // ---------------------------------------------------------------------------
  playBtn.addEventListener("click", () => {
    const song = store.getState().player.currentSong;
    if (song) {
      store.dispatch(playSong(song));
      facade.hostPlay();
    }
  });

  // ---------------------------------------------------------------------------
  // ⏸ PAUSE
  // ---------------------------------------------------------------------------
  pauseBtn.addEventListener("click", () => {
    store.dispatch(pauseSong());
    facade.hostPause();
  });

  // ---------------------------------------------------------------------------
  // ⏭ SIGUIENTE (USANDO STRATEGY)
  // ---------------------------------------------------------------------------
  nextBtn.addEventListener("click", () => {
    const state = store.getState().player;
    const strategy = strategies[state.strategy];

    const nextSongData = strategy.getNextSong(state.currentSong, state.queue);

    if (nextSongData) {
      store.dispatch(nextSong(nextSongData));
      facade.hostChangeSong(nextSongData.id);
    }
  });

  // ---------------------------------------------------------------------------
  // ⏮ ANTERIOR (⭐ NUEVO — AHORA USA getPreviousSong DEL STRATEGY)
  // ---------------------------------------------------------------------------
  prevBtn.addEventListener("click", () => {
    const state = store.getState().player;
    const strategy = strategies[state.strategy]; // ⭐ antes ignorabas la estrategia

    // ⭐ AHORA el botón anterior también usa el patrón STRATEGY
    const prevSongData = strategy.getPreviousSong(
      state.currentSong,
      state.queue
    );

    if (prevSongData) {
      store.dispatch(previousSong(prevSongData));
      facade.hostChangeSong(prevSongData.id);
    }
  });

  // ---------------------------------------------------------------------------
  // 🔄 CAMBIAR ESTRATEGIA DE REPRODUCCIÓN
  // ---------------------------------------------------------------------------
  strategySelect.addEventListener("change", (e) => {
    store.dispatch(setStrategy(e.target.value));
  });

  // ---------------------------------------------------------------------------
  // 📦 EXPORTAR PLAYLIST
  // ---------------------------------------------------------------------------
  exportCsvBtn.addEventListener("click", () => {
    const queue = store.getState().player.queue;
    if (!queue.length) return alert("Playlist vacía");

    facade.exportPlaylist("csv");
  });

  exportJsonBtn.addEventListener("click", () => {
    const queue = store.getState().player.queue;
    if (!queue.length) return alert("Playlist vacía");

    facade.exportPlaylist("json");
  });
}
