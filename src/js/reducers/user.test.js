import Immutable from 'immutable';

import C from './constants';
import reducer from './user';

const state = Immutable.Map({
  userInfo: 'existinguserinfo',
  loading: false,
  loaded: true,
  tosPending: null,
  token: 'existingxyz',
  loggedIn: true
});

const initialState = Immutable.Map({
  userInfo: {},
  loading: false,
  loaded: false,
  tosPending: null,
  token: '',
  loggedIn: false
});

describe('user Reducer', () => {
  it('LOGIN_USER success', () => {
    const action = {
      type: C.LOGIN_USER,
      userInfo: 'newuserinfo',
    };
    expect(reducer(undefined, action)).toEqual(initialState.set('userInfo', 'newuserinfo').set('loggedIn', true).set('loaded', true));
    expect(reducer(state, action)).toEqual(state.set('userInfo', 'newuserinfo'));
  });

  it('LOGOUT_USER success', () => {
    const action = {
      type: C.LOGOUT_USER
    };
    expect(reducer(undefined, action)).toEqual(initialState);
    expect(reducer(state, action)).toEqual(initialState);
  });

  it('SET_TOS_PENDING sets and clears the pending card', () => {
    const action = {
      type: C.SET_TOS_PENDING,
      tosPending: {
        dataset: 'dataset',
        tosUrl: 'https://tos.example/dataset'
      }
    };
    expect(reducer(undefined, action)).toEqual(
      initialState.set('tosPending', action.tosPending)
    );
    expect(reducer(state, action)).toEqual(
      state.set('tosPending', action.tosPending)
    );

    expect(reducer(state.set('tosPending', action.tosPending), {
      type: C.SET_TOS_PENDING,
      tosPending: null
    })).toEqual(state);
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
