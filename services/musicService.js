// src/services/musicService.js

/*
  MusicService
  ---------------------------------------------------------
  Servicio tipo Singleton que interactúa con la API de iTunes.

  Su función es proveer métodos para:
  - Buscar canciones
  - Obtener canciones por género
  - Obtener top canciones
  - Obtener canciones aleatorias
  - Obtener canción por ID
  - Normalizar los datos de iTunes al formato estándar de la app

  Así evitamos que cada componente se conecte directamente
  con datos crudos y formatos diferentes.
*/

class MusicService {

  /* ============================================================
     AQUI EMPIEZA EL PATRON SINGLETON
     - El constructor verifica si ya existe una instancia previa.
     - Si existe, la retorna y NO crea una nueva.
     - Si no existe, crea la instancia única.
     ============================================================ */
  constructor() {
    // Si ya existe una instancia, retornar la existente
    if (MusicService.instance) return MusicService.instance;

    // URL base para todas las peticiones a iTunes
    this.baseUrl = "https://itunes.apple.com/";

    // Guardamos la instancia única
    MusicService.instance = this;
  }
  /* ============================================================
     AQUI TERMINA EL PATRON SINGLETON
     ============================================================ */

  // ======================================================
  // BUSQUEDA GENERAL POR TEXTO
  // ======================================================
  async searchSongs(query) {
    // Construcción de la URL con query en formato seguro
    const url = `${this.baseUrl}search?term=${encodeURIComponent(
      query
    )}&limit=20&entity=song`;

    // Llamada GET
    const res = await fetch(url);

    // Validación del estado
    if (!res.ok) throw new Error("Error al buscar canciones");

    // Parsear JSON
    const data = await res.json();

    // Normalizar lista de resultados
    return this.normalize(data.results);
  }

  // ======================================================
  // TOP SONGS — canciones populares
  // ======================================================
  async getTopSongs(limit = 20) {
    // URL fija con búsqueda por palabra clave “top”
    const url = `${this.baseUrl}search?term=top&media=music&limit=${limit}&entity=song`;

    const res = await fetch(url);

    if (!res.ok) throw new Error("Error obteniendo Top Songs");

    const data = await res.json();

    // Normalizamos para mantener un solo formato en la app
    return this.normalize(data.results);
  }

  // ======================================================
  // CANCIONES POR GENERO
  // ======================================================
  async getByGenre(genre, limit = 20) {
    // Se usa encodeURIComponent para evitar errores con espacios o caracteres especiales
    const url = `${this.baseUrl}search?term=${encodeURIComponent(
      genre
    )}&entity=song&limit=${limit}`;

    const res = await fetch(url);

    if (!res.ok) throw new Error("Error obteniendo canciones por género");

    const data = await res.json();

    return this.normalize(data.results);
  }

  // ======================================================
  // CANCIONES ALEATORIAS
  // ======================================================
  async getRandomSongs(limit = 20) {
    // Lista de términos aleatorios comunes en títulos/temas
    const randomTerms = [
      "love", "night", "dance", "fire", "summer",
      "dream", "party", "energy", "happy", "slow"
    ];

    // Seleccionar un término random
    const random = randomTerms[Math.floor(Math.random() * randomTerms.length)];

    // Reutilizamos searchSongs para evitar duplicar lógica
    return await this.searchSongs(random, limit);
  }

  // ======================================================
  // OBTENER CANCION POR ID
  // ======================================================
  async getSongById(id) {
    // Endpoint específico “lookup”
    const url = `${this.baseUrl}lookup?id=${id}`;

    const res = await fetch(url);

    if (!res.ok) throw new Error("Error al obtener canción");

    const data = await res.json();

    // Normalizamos solo el primer resultado
    return this.normalize([data.results[0]])[0];
  }

  // ======================================================
  // NORMALIZACION DE DATOS
  // Convierte el formato crudo de iTunes → formato estandarizado
  // ======================================================
  normalize(list) {
    // Recorrido de cada canción para transformarla al formato de la app
    return list.map((track) => ({
      id: track.trackId,              // ID único
      title: track.trackName,         // Título de la canción
      artist: track.artistName,       // Nombre del artista
      album: track.collectionName,    // Álbum al que pertenece
      preview: track.previewUrl,      // URL del preview (30 seg)
      cover: track.artworkUrl100,     // Imagen 100x100
      duration: track.trackTimeMillis // Duración en ms
    }));
  }
}

// Instancia única (Singleton)
const musicService = new MusicService();

// Expuesto en window para debug manual
window.musicService = musicService;

export default musicService;
