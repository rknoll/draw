import Player from './Player';
import Game from './Game';

export default class {
  games = {};
  players = {};

  constructor(io) {
    this.io = io;
  }

  join(socket, gameId, user) {
    const player = new Player(socket, gameId, user);
    this.leave(player.id);
    this.players[player.id] = player;
    this.getOrCreateGame(gameId).join(player);
  }

  getOrCreateGame(gameId) {
    if (!this.games[gameId]) {
      this.games[gameId] = new Game(this.io, gameId);
    }
    return this.games[gameId];
  }

  leave(playerId) {
    const player = this.players[playerId];
    if (!player) return;
    delete this.players[playerId];
    const game = this.games[player.gameId];
    if (game && game.leave(player)) delete this.games[game.id];
  }

  guess(playerId, text) {
    const player = this.players[playerId];
    const game = player && this.games[player.gameId];
    if (game) game.guess(player, text);
  }

  command(playerId, command) {
    const player = this.players[playerId];
    const game = player && this.games[player.gameId];
    if (game) game.command(player, command);
  }

  start(playerId) {
    const player = this.players[playerId];
    const game = player && this.games[player.gameId];
    if (game) game.start();
  }

  useWord(playerId, word) {
    const player = this.players[playerId];
    const game = player && this.games[player.gameId];
    if (game) game.useWord(player, word);
  }
}
