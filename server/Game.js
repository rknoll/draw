import levenshtein from 'fast-levenshtein';
import moment from 'moment';
import { PING_TIMEOUT, SELECT_WORD_TIMEOUT, TICK_TIMEOUT } from '../shared/constants';
import protocol from '../shared/protocol';

const words = require(`../${process.env.WORDS_FILE}`);

const encodeWord = (word) => [...word].map((c) => c === ' ' ? c : '_').join('');

export default class {
  pingTimer = setInterval(() => this.pingGame(), PING_TIMEOUT);
  players = [];
  commands = [];
  words = new Set();
  currentWord = '';
  currentWordEncoded = '';
  currentPlayer = '';
  currentCandidates = [];
  guessed = new Set();
  round = 0;
  started = false;
  roundTimer = null;
  roundTime = 0;
  roundTimeoutSeconds = 0;
  selectTimer = null;
  hintTimeouts = [];
  endTime = null;

  constructor(io, id) {
    this.io = io;
    this.id = id;
  }

  pingGame() {
    this.io.to(this.id).emit(protocol.PING);
  }

  updateGame(meta) {
    this.io.to(this.id).emit(protocol.JOINED, {
      id: this.id,
      players: this.users(),
      commands: this.commands,
      currentWord: this.currentWordEncoded,
      currentPlayer: this.currentPlayer,
      started: this.started,
      correct: [...this.guessed],
      points: this.points(),
      roundTime: this.roundTime,
      turnTimeLimitSeconds: this.roundTimeoutSeconds,
      meta,
    });
  }

  users() {
    return this.players.map(({ id, user }) => ({ ...user, id }));
  }

  points() {
    const points = {};
    for (const player of this.players) {
      points[player.id] = player.points;
    }
    return points;
  }

  join(player) {
    this.players.push(player);
    this.updateGame({ reason: 'JOIN', name: player.user.name });
  }

  start({ turnTimeLimitSeconds, durationMinutes }) {
    if (this.started || this.players.length <= 1) return;
    this.started = true;
    this.hintTimeouts = [
      Math.round(turnTimeLimitSeconds / 2),
      Math.round(TICK_TIMEOUT / 1000),
    ];
    this.roundTimeoutSeconds = turnTimeLimitSeconds;
    if (durationMinutes) this.endTime = moment().add(durationMinutes, 'minutes');
    for (const player of this.players) {
      player.reset();
    }
    this.commands = [];
    const nextPlayer = this.nextPlayer();
    if (!nextPlayer) return;
    this.io.to(this.id).emit(protocol.START, { user: nextPlayer.id, turnTimeLimitSeconds });
    this.sendWordCandidates();
  }

  leave(player) {
    this.guessed.delete(player.id);
    this.players = this.players.filter((p) => p.id !== player.id);

    if (!this.players.length) {
      clearInterval(this.pingTimer);
      return true;
    }

    this.updateGame({ reason: 'LEAVE', name: player.user.name });

    if (this.players.length === 1) {
      if (this.started) this.reset();
    } else if (this.currentPlayer === player.id) {
      this.nextRound({ reason: 'LEAVE', name: player.user.name });
    } else if (this.guessed.size === this.players.length) {
      this.nextRound({ reason: 'SUCCESS' });
    }
    return false;
  }

  nextPlayer() {
    return this.players[this.round % this.players.length];
  }

  nextRound(meta) {
    for (const player of this.players) {
      player.nextRound();
    }
    this.commands = [];
    this.currentWord = '';
    this.currentWordEncoded = '';
    this.guessed = new Set();
    if (this.roundTimer) clearTimeout(this.roundTimer);
    this.roundTimer = null;
    this.roundTime = this.roundTimeoutSeconds;

    const roundFinished = meta && meta.reason !== 'SKIPPED';
    if (roundFinished && this.started && this.endTime && moment() >= this.endTime) {
      this.gameOver(meta);
      return;
    }

    const nextPlayer = this.nextPlayer();
    if (!nextPlayer) return;
    this.io.to(this.id).emit(protocol.NEXT_ROUND, {
      user: nextPlayer.id,
      points: this.points(),
      meta,
    });
    this.sendWordCandidates();
  }

  sendWordCandidates() {
    const player = this.nextPlayer();
    if (!player) return;

    this.currentPlayer = player.id;
    const candidates = [];
    if (this.words.size > words.length / 2) this.words.clear();
    while (candidates.length !== 3) {
      const index = Math.floor(Math.random() * words.length);
      const word = words[index];
      if (!word || this.words.has(word)) continue;
      candidates.push(word);
    }
    this.currentCandidates = candidates;
    player.socket.emit(protocol.SELECT_WORD, { words: candidates });
    ++this.round;
    if (this.selectTimer) clearTimeout(this.selectTimer);
    this.selectTimer = setTimeout(() => this.nextRound({
      reason: 'SKIPPED',
      name: player.user.name
    }), SELECT_WORD_TIMEOUT);
  }

  command(player, command) {
    if (!this.canDraw(player)) return;
    this.commands.push({ id: player.id, command });
    this.io.to(this.id).emit(protocol.COMMAND, { id: player.id, command });
  }

  canDraw(player) {
    // Allow all players to draw in the lobby.
    if (!this.started) return true;
    // A player is currently selecting a word.
    if (this.currentWord.length === 0) return false;
    // Allow drawing if the player has guessed the word.
    return this.guessed.has(player.id);
  }

  useWord(player, word) {
    if (this.currentPlayer !== player.id) return;
    if (word && !this.currentCandidates.includes(word)) return;

    if (this.selectTimer) clearTimeout(this.selectTimer);
    this.selectTimer = null;

    if (!word) {
      this.nextRound({ reason: 'SKIPPED', name: player.user.name });
      return;
    }

    this.commands = [];
    this.currentWord = word;
    this.currentWordEncoded = encodeWord(word);
    this.words.add(word);
    this.guessed = new Set([player.id]);
    this.io.to(this.id).emit(protocol.CURRENT_WORD, {
      word: this.currentWordEncoded,
      roundTime: this.roundTimeoutSeconds,
      name: player.user.name,
    });

    if (this.roundTimer) clearTimeout(this.roundTimer);
    this.roundTime = this.roundTimeoutSeconds;
    this.roundTimer = setTimeout(() => this.tickGameRound(), 1000);
  }

  guess(player, text) {
    if (this.compareGuess(player, text)) return;
    this.io.to(this.id).emit(protocol.GUESSED, { name: player.user.name, guess: text });
  }

  compareGuess(player, text) {
    const expected = this.currentWord.toLowerCase().trim();
    const input = text.toLowerCase().trim();
    if (expected.length === 0 || input.length === 0) return false;
    if (this.currentPlayer === player.id) return false;

    if (expected === input) {
      player.socket.emit(protocol.CORRECT, { name: player.user.name, guess: text });
      if (this.guessed.has(player.id)) return true;

      this.io.to(this.id).emit(protocol.OTHER_CORRECT, { user: player.id });
      this.guessed.add(player.id);

      player.guessedWord(this.roundTime);

      const owner = this.players.find((p) => p.id === this.currentPlayer);
      if (owner) owner.drawingGuessed();

      if (this.guessed.size === this.players.length) {
        this.nextRound({ reason: 'SUCCESS' });
      }
      return true;
    }

    if (levenshtein.get(expected, input) === 1) {
      player.socket.emit(protocol.CLOSE_GUESS, { name: player.user.name, guess: text });
      return true;
    }

    return false;
  }

  tickGameRound() {
    --this.roundTime;

    if (this.roundTime === 0) {
      this.nextRound({ reason: 'FAILED_GUESS', word: this.currentWord });
      return;
    }

    if (this.currentWord.length > 0 && this.currentWord.length === this.currentWordEncoded.length) {
      const indices = [];
      for (let i = 0; i < this.currentWord.length; ++i) {
        if (this.currentWord[i] !== ' ' && this.currentWordEncoded[i] === '_') indices.push(i);
      }

      if (this.hintTimeouts.includes(this.roundTime) && indices.length >= 3) {
        const randomIndex = indices[Math.floor(Math.random() * indices.length)];

        this.currentWordEncoded =
          this.currentWordEncoded.substring(0, randomIndex) +
          this.currentWord[randomIndex] +
          this.currentWordEncoded.substring(randomIndex + 1);

        this.io.to(this.id).emit(protocol.CURRENT_WORD, { word: this.currentWordEncoded });
      }
    }

    this.io.to(this.id).emit(protocol.ROUND_TIMER, this.roundTime);
    this.roundTimer = setTimeout(() => this.tickGameRound(), 1000);
  }

  gameOver(meta) {
    const points = this.points();
    this.words = new Set();
    this.started = false;
    this.round = 0;
    this.commands = [{
      command: {
        type: 'over',
        points: Object.entries(points).map(([id, points]) => {
          const player = this.players.find(p => p.id === id);
          return {
            player: {
              id: player.id,
              name: player.user.name,
            },
            points,
          };
        }),
      }
    }];
    this.currentWord = '';
    this.currentWordEncoded = '';
    this.currentPlayer = '';
    this.currentCandidates = [];
    this.guessed = new Set();
    this.hintTimeouts = [];
    if (this.roundTimer) clearTimeout(this.roundTimer);
    this.roundTimer = null;
    this.roundTime = 0;
    if (this.selectTimer) clearTimeout(this.selectTimer);
    this.selectTimer = null;
    this.endTime = null;
    this.io.to(this.id).emit(protocol.GAME_OVER, {
      points,
      meta,
      commands: this.commands,
    });
  }

  reset() {
    this.words = new Set();
    this.started = false;
    this.round = 0;
    this.commands = [];
    this.currentWord = '';
    this.currentWordEncoded = '';
    this.currentPlayer = '';
    this.currentCandidates = [];
    this.guessed = new Set();
    this.hintTimeouts = [];
    if (this.roundTimer) clearTimeout(this.roundTimer);
    this.roundTimer = null;
    this.roundTime = 0;
    if (this.selectTimer) clearTimeout(this.selectTimer);
    this.selectTimer = null;
    this.endTime = null;
    for (const player of this.players) {
      player.reset();
    }
    this.io.to(this.id).emit(protocol.RESET);
  }
};
