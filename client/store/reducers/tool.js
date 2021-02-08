import { types } from '../actions/tool';

const initialState = {
  type: 'line',
  color: '#000000',
  width: 10,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case types.UPDATE_TOOL: {
      const newState = {
        ...state,
        ...action.update,
      };
      if (newState.type === 'fill' && newState.color === 'rainbow') {
        newState.color = '#000000';
      }
      return newState;
    }
    default:
      return state;
  }
};
