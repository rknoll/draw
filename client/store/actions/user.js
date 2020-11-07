import actionTypes from '../../decorators/actionTypes';

export const types = actionTypes('user')({
  SET_NAME: 'SET_NAME',
});

export default {
  setName: (name) => ({
    type: types.SET_NAME,
    name,
  }),
};
