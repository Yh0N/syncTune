export default class LoopStrategy {
  getNextSong(currentSong, queue) {
    const index = queue.findIndex((s) => s.id === currentSong.id);
    return queue[index]; // repetir la misma
  }
}
