import {
  playSong,
  pauseSong,
  nextSong,
  previousSong,
  setStrategy,
  addToQueue,
  setSong,
  addLocalSong
} from "/src/store/playerSlice.js";

import { store } from "/src/store/index.js";
import { strategies } from "/src/patterns/strategy/strategyMap.js";
import WorkerFacade from "/src/services/workerFacade.js";
import { addNotification } from "/src/store/notificationsSlice.js";
import NotificationFactory from "/src/patterns/factory/NotificationFactory.js";

const facade = new WorkerFacade(store);

export default function renderPlayer() {
  const playBtn = document.getElementById("play-btn");
  const pauseBtn = document.getElementById("pause-btn");
  const nextBtn = document.getElementById("next-btn");
  const prevBtn = document.getElementById("prev-btn");
  const strategySelect = document.getElementById("strategy-select");
  const currentSongText = document.getElementById("current-song");

  // local
  const inputLocal = document.getElementById("local-music-input");
  const btnAddLocal = document.getElementById("add-local-music-btn");

  // MIS CANCIONES (Fijo)
  const mySongsList = document.getElementById("my-songs-list");

  const audio = new Audio();

  // Reproduce siguiente
  audio.addEventListener("ended", () => {
    const state = store.getState().player;
    const strategy = strategies[state.strategy];
    const nextSongData = strategy.getNextSong(state.currentSong, state.queue);

    if (nextSongData) {
      store.dispatch(nextSong(nextSongData));
      facade.hostChangeSong(nextSongData.id);
    }
  });

  /* ----------------------------------------
     DIBUJAR "MIS CANCIONES"
  ---------------------------------------- */
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

  /* ----------------------------------------
     SUSCRIPCIÓN GENERAL DEL PLAYER
  ---------------------------------------- */
  store.subscribe(() => {
    const state = store.getState().player;

    // actualizar mis canciones
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

  /* ----------------------------------------
     SUBIR MÚSICA LOCAL — 100% FIJO
  ---------------------------------------- */
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

    // 1️⃣ Guardar solo en MIS CANCIONES
    store.dispatch(addLocalSong(song));

    // 2️⃣ También agregar a la cola
    store.dispatch(addToQueue(song));

    // 3️⃣ Reproducir
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

  /* ----------------------------------------
     CONTROLES
  ---------------------------------------- */
  playBtn.addEventListener("click", () => {
    const song = store.getState().player.currentSong;
    if (song) {
      store.dispatch(playSong(song));
      facade.hostPlay();
    }
  });

  pauseBtn.addEventListener("click", () => {
    store.dispatch(pauseSong());
    facade.hostPause();
  });

  nextBtn.addEventListener("click", () => {
    const state = store.getState().player;
    const strategy = strategies[state.strategy];
    const nextSongData = strategy.getNextSong(state.currentSong, state.queue);

    if (nextSongData) {
      store.dispatch(nextSong(nextSongData));
      facade.hostChangeSong(nextSongData.id);
    }
  });

  prevBtn.addEventListener("click", () => {
    const state = store.getState().player;
    const index = state.queue.findIndex(
      (s) => s.id === state.currentSong.id
    );

    const prevIndex =
      (index - 1 + state.queue.length) % state.queue.length;

    const prevSong = state.queue[prevIndex];

    store.dispatch(previousSong(prevSong));
    facade.hostChangeSong(prevSong.id);
  });

  strategySelect.addEventListener("change", (e) => {
    store.dispatch(setStrategy(e.target.value));
  });
}
