import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router'
import game from './game';
import user from './user';
import tool from './tool';

export default (history) => combineReducers({
  router: connectRouter(history),
  game,
  user,
  tool,
});
