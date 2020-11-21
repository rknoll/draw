import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router'
import game from './game';
import user from './user';
import tool from './tool';
import snackbars from './snackbars';

export default (history) => combineReducers({
  router: connectRouter(history),
  game,
  user,
  tool,
  snackbars,
});
