import { all } from 'redux-saga/effects';
import game from './game';
import user from './user';
import audio from './audio';

export default function* () {
  yield all([
    ...game(),
    ...user(),
    ...audio(),
  ]);
};
