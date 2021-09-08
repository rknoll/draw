import levenshtein from 'fast-levenshtein';
import { addMinutes } from 'date-fns';
import { PING_TIMEOUT, SELECT_WORD_TIMEOUT, TICK_TIMEOUT, MAX_CANDIDATES } from '../shared/constants';
import protocol from '../shared/protocol';
import createHistory from './History';

const words = [...new Set(require(`../${process.env.WORDS_FILE}`))].filter(Boolean);

if (words.length < 3) {
  throw new Error('Expect to receive a list containing at least 3 valid and unique words.');
}

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
  history = null;

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
      currentWordEncoded: this.currentWordEncoded,
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
    if (this.history) this.history.addEvent('join', { ...player.user, id: player.id });
  }

  start(options) {
    const { turnTimeLimitSeconds, durationMinutes } = options;
    if (this.started || this.players.length <= 1) return;
    this.started = true;
    this.hintTimeouts = [
      Math.round(turnTimeLimitSeconds / 2),
      Math.round(TICK_TIMEOUT / 1000),
    ];
    this.roundTimeoutSeconds = turnTimeLimitSeconds;
    if (durationMinutes) this.endTime = addMinutes(new Date(), durationMinutes);
    for (const player of this.players) {
      player.reset();
    }
    this.commands = [];
    const nextPlayer = this.nextPlayer();
    if (!nextPlayer) return;
    if (this.history) this.history.close();
    this.history = createHistory(this, options);
    this.io.to(this.id).emit(protocol.START, { user: nextPlayer.id, turnTimeLimitSeconds });
    this.sendWordCandidates();
  }

  leave(player) {
    this.guessed.delete(player.id);
    this.players = this.players.filter((p) => p.id !== player.id);
    if (this.history) this.history.addEvent('leave', { id: player.id });

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
    if (roundFinished && this.started && this.endTime && new Date() >= this.endTime) {
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
    if (this.history) {
      this.history.addEvent('nextRound', {
        id: this.currentPlayer,
        words: this.currentCandidates,
        meta,
      });
    }
  }

  getShuffledCandidates() {
    const availableWords = words.filter(word => !this.words.has(word));
    const cycleLimit = (availableWords.length - 1) - MAX_CANDIDATES;
    
    for (let i = availableWords.length - 1; i > 0 && i > cycleLimit; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      const refWordSwapped = availableWords[i];
      availableWords[i] = availableWords[randomIndex];
      availableWords[randomIndex] = refWordSwapped;
    }
  
    return availableWords.slice(-MAX_CANDIDATES);
  }

  sendWordCandidates() {
    const player = this.nextPlayer();
    if (!player) return;

    this.currentPlayer = player.id;

    const shouldClearWordsPlayed =
    this.words.size > words.length / 2 ||
    words.length - this.words.size < MAX_CANDIDATES;    
    if (shouldClearWordsPlayed) this.words.clear();

    this.currentCandidates = this.getShuffledCandidates();

    player.socket.emit(protocol.SELECT_WORD, { words: this.currentCandidates });
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
    if (this.history) this.history.addEvent('draw', { id: player.id, command });
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
    if (this.history) {
      this.history.addEvent('useWord', {
        id: player.id,
        word,
        encoded: this.currentWordEncoded,
      });
    }
  }

  // Reveals the character at |index| to guessing players if the |player| is
  // allowed to do so and a game is currently in progress.
  revealCharacter(player, index) {
    if (!this.started || !this.canDraw(player)) return;
    this.revealCharacterIndex(index);
  }

  // Reveals the character at |index| and broadcasts the updated encoded word.
  // No-op if |index| is out of bounds or that character has already been
  // revealed.
  revealCharacterIndex(index) {
    if (!this.currentWordEncoded) return;
    if (index < 0 || index >= this.currentWordEncoded.length) return;
    if (this.currentWordEncoded[index] !== '_') return;

    this.currentWordEncoded =
      this.currentWordEncoded.substring(0, index) +
      this.currentWord[index] +
      this.currentWordEncoded.substring(index + 1);

    this.io.to(this.id).emit(protocol.CURRENT_WORD, { word: this.currentWordEncoded });
    if (this.history) {
      this.history.addEvent('revealCharacter', {
        index,
        encoded: this.currentWordEncoded,
      });
    }
  }

  guess(player, text) {
    if (this.history) {
      this.history.addEvent('guess', {
        id: player.id,
        text,
      });
    }
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
        this.revealCharacterIndex(randomIndex);
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
    if (this.history) this.history.close();
    this.history = null;
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
    if (this.history) this.history.close();
    this.history = null;
  }
};
