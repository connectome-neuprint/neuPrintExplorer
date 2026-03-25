import Immutable from 'immutable';

import C from './constants';
import reducer from './user';

const state = Immutable.Map({
  userInfo: 'existinguserinfo',
  loading: false,
  loaded: true,
  tosRequired: false,
  token: 'existingxyz',
  loggedIn: true
});

const initialState = Immutable.Map({
  userInfo: {},
  loading: false,
  loaded: false,
  tosRequired: false,
  token: '',
  loggedIn: false
});

describe('user Reducer', () => {
  it('LOGIN_USER success', () => {
    const action = {
      type: C.LOGIN_USER,
      userInfo: 'newuserinfo',
    };
    expect(reducer(undefined, action)).toEqual(initialState.set('userInfo', 'newuserinfo').set('tosRequired', false).set('loggedIn', true).set('loaded', true));
    expect(reducer(state, action)).toEqual(state.set('userInfo', 'newuserinfo').set('tosRequired', false));
  });

  it('LOGOUT_USER success', () => {
    const action = {
      type: C.LOGOUT_USER
    };
    expect(reducer(undefined, action)).toEqual(initialState);
    expect(reducer(state, action)).toEqual(initialState);
  });

  it('TOS_REQUIRED success', () => {
    const action = {
      type: C.TOS_REQUIRED,
    };
    expect(reducer(undefined, action)).toEqual(
      initialState.set('loaded', true).set('tosRequired', true).set('loggedIn', false)
    );
    expect(reducer(state, action)).toEqual(
      state.set('loading', false).set('loaded', true).set('tosRequired', true).set('loggedIn', false)
    );
  });

  it('SET_USER_TOKEN success', () => {
    const action = {
      type: C.SET_USER_TOKEN,
      token: 'testToken'
    };
    expect(reducer(undefined, action)).toEqual(initialState.set('token', 'testToken'));
    expect(reducer(state, action)).toEqual(state.set('token', 'testToken'));
  });
});
