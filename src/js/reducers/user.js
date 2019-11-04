/*
 * Store user state / login.
*/

import Immutable from 'immutable';
import C from './constants';

const userState = Immutable.Map({
  loggedIn: false,
  loading: false,
  loaded: false,
  userInfo: {},
  token: ''
});

export default function userReducer(state = userState, action) {
  switch (action.type) {
    case C.LOGIN_CHECK: {
      return state.set('loading', true).set('loaded', false);
    }
    case C.LOGIN_FAILED: {
      return state.set('loading', false).set('loaded', true);
    }
    case C.LOGIN_USER: {
      return state.set('loading', false).set('loaded', true).set('userInfo', action.userInfo).set('loggedIn', true);
    }
    case C.LOGOUT_USER: {
      return state.set('loaded', false).set('userInfo', {}).set('token', '').set('loggedIn', false);
    }
    case C.SET_USER_TOKEN: {
      return state.set('token', action.token);
    }
    default: {
      return state;
    }
  }
}
