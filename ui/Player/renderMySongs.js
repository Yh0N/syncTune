import { store } from "../../store/index.js";
import { setSong, playSong } from "../../store/playerSlice.js";

export default function renderMySongs() {
  const list = document.getElementById("my-songs-list");

  store.subscribe(() => {
    const state = store.getState().player;
    const songs = state.localSongs;

    list.innerHTML = "";

    songs.forEach(song => {
      const li = document.createElement("li");
      li.textContent = song.title;
      li.style.padding = "6px";
      li.style.cursor = "pointer";

      li.addEventListener("click", () => {
        store.dispatch(setSong(song));
        store.dispatch(playSong(song));
      });

      list.appendChild(li);
    });
  });
}
