import C from '../../../src/js/reducers/constants';
import reducer from '../../../src/js/reducers/user';
import Immutable from 'immutable';

const state = Immutable.Map({
  userInfo: 'existinguserinfo',
  token: 'existingxyz'
});

const initialState = Immutable.Map({
  userInfo: null,
  token: ''
});

describe('user Reducer', () => {
  it('LOGIN_USER success', () => {
    const action = {
      type: C.LOGIN_USER,
      userInfo: 'newuserinfo'
    };
    expect(reducer(undefined, action)).toEqual(initialState.set('userInfo', 'newuserinfo'));
    expect(reducer(state, action)).toEqual(state.set('userInfo', 'newuserinfo'));
  });

  it('LOGOUT_USER success', () => {
    const action = {
      type: C.LOGOUT_USER
    };
    expect(reducer(undefined, action)).toEqual(initialState);
    expect(reducer(state, action)).toEqual(initialState);
  });
});
