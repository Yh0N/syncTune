export default class ShuffleStrategy {
  getNextSong(_, queue) {
    const randomIndex = Math.floor(Math.random() * queue.length);
    return queue[randomIndex];
  }
}
