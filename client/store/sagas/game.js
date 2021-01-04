import { eventChannel } from 'redux-saga';
import { call, fork, put, race, select, take, takeEvery } from 'redux-saga/effects'
import { LOCATION_CHANGE, push } from 'connected-react-router';
import { v4 as uuidv4 } from 'uuid';
import io from 'socket.io-client';
import gameActions, { types } from '../actions/game';
import protocol from '../../../shared/protocol';

function connect() {
  const socket = io('/');
  return new Promise((resolve, reject) => {
    socket.on('connect', () => {
      resolve(socket);
    });
    socket.on('connect_error', (error) => {
      socket.close();
      reject(error);
    });
    socket.on('connect_timeout', (timeout) => {
      socket.close();
      reject(timeout);
    });
  });
}

function* createGame() {
  const id = uuidv4();
  yield put(push(`/${id}`));
}

function* exitGame() {
  const state = yield select();
  if (state.router.location.pathname === '/') return;
  yield put(push('/'));
}

export function* subscribe(socket) {
  return new eventChannel((emit) => {
    socket.on(protocol.JOINED, (data) => emit(gameActions.connectedGame(socket.id, data)));
    socket.on(protocol.GUESSED, ({ name, guess }) => emit(gameActions.guessed(name, guess, false)));
    socket.on(protocol.COMMAND, ({ id, command }) => emit(gameActions.command(id, command)));
    socket.on(protocol.START, ({ user, turnTimeLimitSeconds }) => emit(gameActions.startedGame(user, turnTimeLimitSeconds)));
    socket.on(protocol.SELECT_WORD, ({ words }) => emit(gameActions.selectWord(words)));
    socket.on(protocol.CURRENT_WORD, ({ word, roundTime, name }) => emit(gameActions.currentWord(word, roundTime, name)));
    socket.on(protocol.RESET, () => emit(gameActions.reset()));
    socket.on(protocol.PING, () => socket.emit(protocol.PONG));
    socket.on(protocol.OTHER_CORRECT, ({ user }) => emit(gameActions.otherGuessed(user)));
    socket.on(protocol.ROUND_TIMER, (roundTime) => emit(gameActions.roundTime(roundTime)));
    socket.on(protocol.CLOSE_GUESS, ({ name, guess }) => {
      emit(gameActions.guessed(name, guess, false));
      emit(gameActions.closeGuess(guess));
    });
    socket.on(protocol.CORRECT, ({ name, guess }) => {
      emit(gameActions.guessed(name, guess, true));
      emit(gameActions.correctGuess(guess));
    });
    socket.on(protocol.NEXT_ROUND, (data) => emit(gameActions.nextRound(data)));
    socket.on(protocol.GAME_OVER, (data) => emit(gameActions.gameOver(data)));
    socket.on('disconnect', () => emit(gameActions.exitGame()));
    return () => {};
  });
}

function* readSocket(socket) {
  const channel = yield call(subscribe, socket);
  while (true) {
    let action = yield take(channel);
    yield put(action);
  }
}

function* connectGame({ id, user }) {
  try {
    const socket = yield call(connect);
    yield fork(readSocket, socket);
    socket.emit(protocol.JOIN, { id, user });

    const { exited } = yield race({
      connected: take(types.CONNECTED_GAME),
      exited: take(types.EXIT_GAME),
    });

    if (exited) {
      socket.close();
      return;
    }

    while (true) {
      const { guess, exited, sendCommand, start, useWord, revealCharacter } = yield race({
        guess: take(types.GUESS),
        exited: take(types.EXIT_GAME),
        sendCommand: take(types.SEND_COMMAND),
        start: take(types.START),
        useWord: take(types.USE_WORD),
        revealCharacter: take(types.REVEAL_CHARACTER),
      });
      if (exited) break;
      if (guess) socket.emit(protocol.GUESS, guess.guess);
      if (sendCommand) socket.emit(protocol.COMMAND, sendCommand.command);
      if (start) socket.emit(protocol.START, start.options);
      if (useWord) socket.emit(protocol.USE_WORD, useWord.word);
      if (revealCharacter) socket.emit(protocol.REVEAL_CHARACTER, revealCharacter.index);
    }

    socket.close();
  } catch (error) {
    console.error(error);
  }
}

function* locationChanged({ payload }) {
  const state = yield select();
  const id = payload.location.pathname.match(/^\/([^\/]*)/)[1];
  if (state.game.id === id) return;
  if (id && state.user.name) return yield put(gameActions.connectGame(id, state.user));
  if (!id) yield put(gameActions.exitGame());
}

function* watchCreateGame() {
  yield takeEvery(types.CREATE_GAME, createGame);
}

function* watchExitGame() {
  yield takeEvery(types.EXIT_GAME, exitGame);
}

function* watchConnectGame() {
  yield takeEvery(types.CONNECT_GAME, connectGame);
}

function* watchLocationChange() {
  yield takeEvery(LOCATION_CHANGE, locationChanged);
}

export default () => [
  watchCreateGame(),
  watchExitGame(),
  watchConnectGame(),
  watchLocationChange(),
];
