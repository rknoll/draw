import { put, select, takeEvery } from 'redux-saga/effects'
import gameActions from '../actions/game';
import { types } from '../actions/user';

function* setName() {
  const state = yield select();
  const id = state.router.location.pathname.match(/^\/([^\/]*)/)[1];
  if (state.game.id === id) return;
  if (id) yield put(gameActions.connectGame(id, state.user));
}

function* watchSetName() {
  yield takeEvery(types.SET_NAME, setName);
}

export default () => [
  watchSetName(),
];
