/*
 * Store user state / login.
*/

import Immutable from 'immutable';
import C from './constants';

const userState = Immutable.Map({
  loggedIn: false,
  userInfo: {},
  token: ''
});

export default function userReducer(state = userState, action) {
  switch (action.type) {
    case C.LOGIN_USER: {
      return state.set('userInfo', action.userInfo).set('loggedIn', true);
    }
    case C.LOGOUT_USER: {
      return state.set('userInfo', {}).set('token', '').set('loggedIn', false);
    }
    case C.SET_USER_TOKEN: {
      return state.set('token', action.token);
    }
    default: {
      return state;
    }
  }
}
