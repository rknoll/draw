import { race, take, takeEvery } from 'redux-saga/effects'
import { types } from '../actions/game';
import audio from '../../audio'
import { TICK_TIMEOUT } from '../../../shared/constants'

function roundTimer({ roundTime }) {
  if (roundTime <= Math.floor(TICK_TIMEOUT / 1000)) audio.TICK();
}

function otherCorrectGuess() {
  audio.PLAYER_GUESSED();
}

function connectedGame({ data: { meta } }) {
  switch (meta.reason) {
    case 'JOIN':
      return audio.JOIN();
    case 'LEAVE':
      return audio.LEAVE();
    default:
      break;
  }
}

function nextRound({ meta }) {
  switch (meta.reason) {
    case 'FAILED_GUESS':
    case 'SKIPPED':
    case 'LEAVE':
      return audio.ROUND_END_FAILURE();
    case 'SUCCESS':
      return audio.ROUND_END_SUCCESS();
    default:
      break;
  }
}

function* watchRoundTimer() {
  yield takeEvery(types.ROUND_TIME, roundTimer);
}

function* watchOtherCorrectGuess() {
  yield takeEvery(types.OTHER_CORRECT_GUESS, otherCorrectGuess);
}

function* watchConnectedGame() {
  yield takeEvery(types.CONNECTED_GAME, connectedGame);
}

function* watchNextRound() {
  let hasWord = false;
  while (true) {
    const { nextRoundData, connectedData } = yield race({
      currentWord: take(types.CURRENT_WORD),
      connectedData: take(types.CONNECTED_GAME),
      nextRoundData: take(types.NEXT_ROUND),
    });
    if (connectedData) {
      hasWord = connectedData.data.currentWord.length > 0;
    } else if (nextRoundData) {
      hasWord = false;
      nextRound(nextRoundData);
    } else {
      if (!hasWord) audio.ROUND_START();
      hasWord = true;
    }
  }
}

function* watchReset() {
  let started = false;
  while (true) {
    const { start, connectedData } = yield race({
      start: take(types.START),
      connectedData: take(types.CONNECTED_GAME),
      reset: take(types.RESET),
    });
    if (connectedData) {
      started = connectedData.data.started;
    } else if (start) {
      started = true;
    } else if (started) {
      started = false;
      audio.ROUND_END_FAILURE();
    }
  }
}

export default () => [
  watchRoundTimer(),
  watchOtherCorrectGuess(),
  watchConnectedGame(),
  watchNextRound(),
  watchReset(),
];
