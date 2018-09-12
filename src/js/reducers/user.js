/*
 * Store user state / login.
*/

"use strict";

import C from "./constants"

var userState = {
    userInfo: null,
    token: "",
}

export default function userReducer(state = userState, action) {
    switch (action.type) {
        case C.LOGIN_USER: {
            return Object.assign({}, state, { userInfo: action.userInfo });
        }
        case C.LOGOUT_USER: {
            return Object.assign({}, state, { userInfo: null, token: "" });
        }
        case C.SET_USER_TOKEN: {
            return Object.assign({}, state, { token: action.token });
        }
        default: {
            return state;
        }
    }
}
