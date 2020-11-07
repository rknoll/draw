import actionTypes from '../../decorators/actionTypes';

export const types = actionTypes('tool')({
  UPDATE_TOOL: 'UPDATE_TOOL',
});

export default {
  updateTool: (update) => ({
    type: types.UPDATE_TOOL,
    update,
  }),
};
