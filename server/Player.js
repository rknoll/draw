export default class {
  points = 0;
  nextPoints = 0;

  constructor(socket, gameId, user) {
    this.id = socket.id;
    this.user = user;
    this.socket = socket;
    this.gameId = gameId;
  }

  nextRound() {
    this.points = this.nextPoints;
  }

  // Called when this player correctly guessed the current word.
  guessedWord(roundTime) {
    this.nextPoints += roundTime;
  }

  // Called when a different player guessed the word this player is drawing.
  drawingGuessed() {
    this.nextPoints += 10;
  }

  reset() {
    this.points = 0;
    this.nextPoints = 0;
  }
}
