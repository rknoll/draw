import { types } from '../actions/snackbars';

export default (state = [], action) => {
  switch (action.type) {
    case types.SHOW: {
      const newState = [...state, { data: action.data, show: false }];
      if (newState.length === 1) newState[0].show = true;
      return newState;
    }
    case types.HIDE: {
      const newState = [...state];
      if (newState.length > 0) newState[0].show = false;
      return newState;
    }
    case types.REMOVE: {
      const newState = state.slice(1);
      if (newState.length > 0) newState[0].show = true;
      return newState;
    }
    default:
      return state;
  }
};
