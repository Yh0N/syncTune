// src/services/musicService.js

class MusicService {
  constructor() {
    if (MusicService.instance) return MusicService.instance;

    this.baseUrl = "https://itunes.apple.com/";
    MusicService.instance = this;
  }

  // ======================================================
  // 🔍 BÚSQUEDA NORMAL POR TÉRMINO
  // ======================================================
  async searchSongs(query) {
    const url = `${this.baseUrl}search?term=${encodeURIComponent(
      query
    )}&limit=20&entity=song`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Error al buscar canciones");

    const data = await res.json();

    return this.normalize(data.results);
  }

  // ======================================================
  // ⭐ 1. TOP SONGS (POPULARES)
  // ======================================================
  async getTopSongs(limit = 20) {
    const url = `${this.baseUrl}search?term=top&media=music&limit=${limit}&entity=song`;
    const res = await fetch(url);

    if (!res.ok) throw new Error("Error obteniendo Top Songs");

    const data = await res.json();
    return this.normalize(data.results);
  }

  // ======================================================
  // ⭐ 2. POR GÉNERO (ROCK, POP, SALSA, ETC.)
  // ======================================================
  async getByGenre(genre, limit = 20) {
    const url = `${this.baseUrl}search?term=${encodeURIComponent(
      genre
    )}&entity=song&limit=${limit}`;

    const res = await fetch(url);

    if (!res.ok) throw new Error("Error obteniendo canciones por género");

    const data = await res.json();
    return this.normalize(data.results);
  }

  // ======================================================
  // ⭐ 3. CANCIONES ALEATORIAS
  // ======================================================
  async getRandomSongs(limit = 20) {
    const randomTerms = [
      "love", "night", "dance", "fire", "summer",
      "dream", "party", "energy", "happy", "slow"
    ];

    const random = randomTerms[Math.floor(Math.random() * randomTerms.length)];

    return await this.searchSongs(random, limit);
  }

  // ======================================================
  // 🔎 Obtener una canción por ID
  // ======================================================
  async getSongById(id) {
    const url = `${this.baseUrl}lookup?id=${id}`;
    const res = await fetch(url);

    if (!res.ok) throw new Error("Error al obtener canción");

    const data = await res.json();
    return this.normalize([data.results[0]])[0];
  }

  // ======================================================
  // 🔧 NORMALIZACIÓN (para que toda la app use el mismo formato)
  // ======================================================
  normalize(list) {
    return list.map((track) => ({
      id: track.trackId,
      title: track.trackName,
      artist: track.artistName,
      album: track.collectionName,
      preview: track.previewUrl,
      cover: track.artworkUrl100,
      duration: track.trackTimeMillis,
    }));
  }
}

// Singleton
const musicService = new MusicService();
window.musicService = musicService; // para pruebas desde consola

export default musicService;
