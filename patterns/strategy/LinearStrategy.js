export default class LinearStrategy {
  getNextSong(currentSong, queue) {
    const index = queue.findIndex((s) => s.id === currentSong.id);
    return queue[index + 1] || queue[0];
  }
}
