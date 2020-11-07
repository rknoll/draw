import { types } from '../actions/user';

const initialState = {
  name: localStorage.getItem('name') || '',
};

export default (state = initialState, action) => {
  switch (action.type) {
    case types.SET_NAME:
      localStorage.setItem('name', action.name);
      return {
        ...state,
        name: action.name,
      };
    default:
      return state;
  }
};
