import C from '../reducers/constants';

export function authError(error) {
  return {
    type: C.AUTH_ERROR,
    error,
  };
}

export function logoutUser() {
  return {
    type: C.LOGOUT_USER
  };
}

export function reAuth() {
  return {
    type: C.LOGOUT_USER
  };
}
