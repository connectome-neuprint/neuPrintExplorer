import Immutable from 'immutable';

var errorsState = Immutable.Map({
  message: null,
});

export default function errorsReducer(state = errorsState, action) {
  if (action.type.match(/ERROR$/)) {
    if (typeof(action.error) === 'string') {
      return state.set('message', action.error);
    }
    return state.set('message', action.error.message);
  } else if (action.type.match('CLEAR_ERRORS')) {
    return errorsState;
  }
  return state;
}
