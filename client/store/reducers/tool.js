import { types } from '../actions/tool';

const initialState = {
  type: 'line',
  color: '#000000',
  width: 10,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case types.UPDATE_TOOL:
      return {
        ...state,
        ...action.update,
      };
    default:
      return state;
  }
};
