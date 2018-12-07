import Immutable from 'immutable';

const errorsState = Immutable.Map({
  message: null
});

export default function errorsReducer(state = errorsState, action) {
  if (action.type && action.type.match(/ERROR$/)) {
    if (typeof action.error === 'string') {
      return state.set('message', action.error);
    }
    return state.set('message', action.error.message);
  }
  if (action.type && action.type.match('CLEAR_ERRORS')) {
    return errorsState;
  }
  return state;
}
