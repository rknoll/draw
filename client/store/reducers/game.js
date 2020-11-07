import { types } from '../actions/game';

const initialState = {
  id: '',
  connecting: false,
  connected: false,
  players: [],
  self: '',
  guesses: [],
  commands: [],
  started: false,
  words: [],
  currentWord: '',
  selectedWord: '',
  currentPlayer: '',
  correct: [],
  points: {},
  roundTime: 0,
};

const addMessage = (state, message) => ({ ...state, guesses: [...state.guesses, message] });

export default (state = initialState, action) => {
  switch (action.type) {
    case types.CONNECT_GAME:
      return {
        ...state,
        id: action.id,
        connecting: true,
        players: [],
        self: '',
        commands: [],
        connected: false,
        started: false,
        words: [],
        points: {},
        roundTime: 0,
      };
    case types.CONNECTED_GAME: {
      const { meta, ...rest } = action.data;
      let nextState = {
        ...state,
        ...rest,
        self: action.self,
        connecting: false,
        connected: true,
      };
      switch (meta.reason) {
        case 'JOIN':
          nextState = addMessage(nextState, { type: 'JOIN', name: meta.name });
          break;
        case 'LEAVE':
          nextState = addMessage(nextState, { type: 'LEAVE', name: meta.name });
          break;
        default:
          break;
      }
      return nextState;
    }
    case types.EXIT_GAME:
      return {
        ...state,
        id: '',
        connecting: false,
        players: [],
        self: '',
        guesses: [],
        commands: [],
        connected: false,
        started: false,
        words: [],
        currentWord: '',
        selectedWord: '',
        currentPlayer: '',
        correct: [],
        points: {},
        roundTime: 0,
      };
    case types.GUESSED:
      return addMessage(state, { type: 'GUESS', name: action.name, guess: action.guess, correct: action.correct });
    case types.CLOSE_GUESS:
      return addMessage(state, { type: 'CLOSE_GUESS', guess: action.guess });
    case types.COMMAND:
      return {
        ...state,
        commands: [
          ...state.commands,
          { id: action.id, command: action.command },
        ],
      };
    case types.STARTED:
      return {
        ...state,
        started: true,
        commands: [],
        currentPlayer: action.user,
        correct: [action.user],
        points: {},
      };
    case types.SELECT_WORD:
      return {
        ...state,
        words: action.words,
      };
    case types.USE_WORD:
      return {
        ...state,
        selectedWord: action.word,
        correct: [state.self],
      };
    case types.CORRECT_GUESS:
      return {
        ...state,
        selectedWord: action.word,
      };
    case types.OTHER_CORRECT_GUESS: {
      let nextState = {
        ...state,
        correct: [...new Set([...state.correct, action.user])],
      };
      const player = state.players.find(p => p.id === action.user);
      if (player) nextState = addMessage(nextState, { type: 'CORRECT_GUESS', name: player.name, correct: true });
      return nextState;
    }
    case types.CURRENT_WORD: {
      let nextState = {
        ...state,
        currentWord: action.word,
      };
      if (action.roundTime) nextState.roundTime = action.roundTime;
      if (state.currentWord.length === 0 && nextState.currentWord.length > 0 && action.name) {
        nextState = addMessage(nextState, { type: 'DRAWING', name: action.name });
      }
      return nextState;
    }
    case types.ROUND_TIME:
      return {
        ...state,
        roundTime: action.roundTime,
      };
    case types.NEXT_ROUND: {
      let nextState = {
        ...state,
        commands: [],
        words: [],
        currentWord: '',
        selectedWord: '',
        currentPlayer: action.user,
        correct: [action.user],
        points: action.points,
        roundTime: 0,
      };
      switch (action.meta.reason) {
        case 'SUCCESS':
          nextState = addMessage(nextState, { type: 'ALL_GUESSED', correct: true });
          break;
        case 'FAILED_GUESS':
          nextState = addMessage(nextState, { type: 'FAILED_GUESS', word: action.meta.word });
          break;
        case 'SKIPPED':
          nextState = addMessage(nextState, { type: 'SKIPPED', name: action.meta.name });
          break;
        case 'LEAVE':
          nextState = addMessage(nextState, { type: 'LEAVE_TURN', name: action.meta.name });
          break;
        default:
          break;
      }
      return nextState;
    }
    case types.RESET:
      return {
        ...state,
        commands: [],
        words: [],
        currentWord: '',
        selectedWord: '',
        started: false,
        currentPlayer: '',
        correct: [],
        points: {},
        roundTime: 0,
      };
    default:
      return state;
  }
};
