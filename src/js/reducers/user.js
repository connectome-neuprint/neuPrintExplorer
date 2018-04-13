/*
 * Store user state / login.
*/

"use strict";

var userState = {
    userInfo: null,
}

export default function userReducer(state = userState, action) {
    switch(action.type) {
        case 'LOGIN_USER' : {
            return Object.assign({}, state, {userInfo: action.userInfo});
        }
        case 'LOGOUT_USER' : {
            return Object.assign({}, state, {userInfo: null});
        }
        default: {
            return state;
        }
    }
}
