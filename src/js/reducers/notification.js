import Immutable from 'immutable';
import C from './constants';

const notificationState = Immutable.Map({
  message: null
});

export default function notificationReducer(state = notificationState, action) {
  if (action.type === C.NOTIFICATION) {
    if (typeof action.notification === 'string') {
      return state.set('message', action.notification);
    }
    return state.set('message', action.notification.message);
  }
  if (action.type === C.CLEAR_NOTIFICATION) {
    return notificationState;
  }
  return state;
}
