// LinearStrategy
// ---------------
// Estrategia de reproducción secuencial.
// Cuando una canción termina, avanza a la siguiente en la cola.
// Si llega al final, vuelve al inicio (comportamiento circular).

export default class LinearStrategy {
  getNextSong(currentSong, queue) {
    // Busca el índice de la canción actual dentro de la cola
    const index = queue.findIndex((s) => s.id === currentSong.id);

    // Devuelve la siguiente canción o vuelve al inicio si terminó la lista
    return queue[index + 1] || queue[0];
  }
}
