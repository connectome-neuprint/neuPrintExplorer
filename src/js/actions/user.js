import C from '../reducers/constants';

export function authError(error) {
  return {
    type: C.AUTH_ERROR,
    error,
  };
}

export function reAuth() {
  return {
    type: C.LOGOUT_USER
  };
}
