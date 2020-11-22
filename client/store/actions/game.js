import actionTypes from '../../decorators/actionTypes';

export const types = actionTypes('game')({
  CREATE_GAME: 'CREATE_GAME',
  CONNECT_GAME: 'CONNECT_GAME',
  CONNECTED_GAME: 'CONNECTED_GAME',
  EXIT_GAME: 'EXIT_GAME',
  GUESS: 'GUESS',
  GUESSED: 'GUESSED',
  SEND_COMMAND: 'SEND_COMMAND',
  COMMAND: 'COMMAND',
  SET_STARTING: 'SET_STARTING',
  START: 'START',
  STARTED: 'STARTED',
  SELECT_WORD: 'SELECT_WORD',
  USE_WORD: 'USE_WORD',
  CURRENT_WORD: 'CURRENT_WORD',
  CORRECT_GUESS: 'CORRECT_GUESS',
  NEXT_ROUND: 'NEXT_ROUND',
  RESET: 'RESET',
  OTHER_CORRECT_GUESS: 'OTHER_CORRECT_GUESS',
  ROUND_TIME: 'ROUND_TIME',
  CLOSE_GUESS: 'CLOSE_GUESS',
});

export default {
  createGame: () => ({
    type: types.CREATE_GAME,
  }),
  connectGame: (id, user) => ({
    type: types.CONNECT_GAME,
    id,
    user,
  }),
  connectedGame: (self, data) => ({
    type: types.CONNECTED_GAME,
    self,
    data,
  }),
  exitGame: () => ({
    type: types.EXIT_GAME,
  }),
  guess: (guess) => ({
    type: types.GUESS,
    guess,
  }),
  guessed: (name, guess, correct) => ({
    type: types.GUESSED,
    name,
    guess,
    correct,
  }),
  closeGuess: (guess) => ({
    type: types.CLOSE_GUESS,
    guess,
  }),
  otherGuessed: (user) => ({
    type: types.OTHER_CORRECT_GUESS,
    user,
  }),
  sendCommand: (command) => ({
    type: types.SEND_COMMAND,
    command,
  }),
  command: (id, command) => ({
    type: types.COMMAND,
    id,
    command,
  }),
  setStarting: (starting) => ({
    type: types.SET_STARTING,
    starting,
  }),
  startGame: (options) => ({
    type: types.START,
    options,
  }),
  startedGame: (user, turnTimeLimitSeconds) => ({
    type: types.STARTED,
    user,
    turnTimeLimitSeconds,
  }),
  selectWord: (words) => ({
    type: types.SELECT_WORD,
    words,
  }),
  useWord: (word) => ({
    type: types.USE_WORD,
    word,
  }),
  currentWord: (word, roundTime, name) => ({
    type: types.CURRENT_WORD,
    word,
    roundTime,
    name,
  }),
  correctGuess: (word) => ({
    type: types.CORRECT_GUESS,
    word,
  }),
  nextRound: (data) => ({
    type: types.NEXT_ROUND,
    ...data,
  }),
  reset: () => ({
    type: types.RESET,
  }),
  roundTime: (roundTime) => ({
    type: types.ROUND_TIME,
    roundTime,
  }),
};
