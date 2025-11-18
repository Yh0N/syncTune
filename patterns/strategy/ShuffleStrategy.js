// ShuffleStrategy
// ----------------
// Estrategia aleatoria.
// Cada vez que una canción termina, selecciona otra al azar.

export default class ShuffleStrategy {
  getNextSong(_, queue) {
    // Selecciona un índice aleatorio dentro del rango de la cola
    const randomIndex = Math.floor(Math.random() * queue.length);

    // Devuelve la canción aleatoria
    return queue[randomIndex];
  }
}
