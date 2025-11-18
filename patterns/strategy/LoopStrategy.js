// LoopStrategy
// --------------
// Estrategia de repetición.
// Siempre devuelve la misma canción y nunca avanza en la lista.

export default class LoopStrategy {
  getNextSong(currentSong, queue) {
    // Encuentra el índice de la canción actual
    const index = queue.findIndex((s) => s.id === currentSong.id);

    // Devuelve la misma canción, repitiéndola indefinidamente
    return queue[index];
  }
}
