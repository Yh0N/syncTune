// src/services/musicService.js

/*
  MusicService
  ──────────────────────────────────────────────
  Servicio tipo Singleton que interactúa con la API de iTunes.

  Funciona como un módulo especializado en:
  Buscar canciones
  Obtener canciones por género
  Obtener canciones populares
  Obtener canciones aleatorias
  Normalizar los resultados (formato estándar para toda la app)

  Esto evita que cada UI tenga que interpretar datos crudos de iTunes.
*/

class MusicService {
  constructor() {
    // Singleton: si ya existe, se retorna la instancia previa
    if (MusicService.instance) return MusicService.instance;

    this.baseUrl = "https://itunes.apple.com/";
    MusicService.instance = this;
  }

  // ======================================================
  // 🔍 BÚSQUEDA GENERAL POR TEXTO
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
  // ⭐ 1. TOP SONGS
  // ======================================================
  async getTopSongs(limit = 20) {
    const url = `${this.baseUrl}search?term=top&media=music&limit=${limit}&entity=song`;
    const res = await fetch(url);

    if (!res.ok) throw new Error("Error obteniendo Top Songs");

    const data = await res.json();
    return this.normalize(data.results);
  }

  // ======================================================
  // ⭐ 2. FILTRAR POR GÉNERO
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
  // ⭐ 3. CANCIONES ALEATORIAS (usando términos aleatorios)
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
  // 🔎 Obtener canción específica por ID
  // ======================================================
  async getSongById(id) {
    const url = `${this.baseUrl}lookup?id=${id}`;
    const res = await fetch(url);

    if (!res.ok) throw new Error("Error al obtener canción");

    const data = await res.json();

    // Normalizamos y devolvemos la primera coincidencia
    return this.normalize([data.results[0]])[0];
  }

  // ======================================================
  // 🔧 NORMALIZACIÓN
  // Convierte el formato de iTunes → formato estándar de la app
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

// Singleton exportado
const musicService = new MusicService();
window.musicService = musicService; // útil para testing en consola
export default musicService;
