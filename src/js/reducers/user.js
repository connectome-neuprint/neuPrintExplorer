/*
 * Store user state / login.
*/

"use strict";

import C from "./constants"

var userState = {
    userInfo: null,
}

export default function userReducer(state = userState, action) {
    switch (action.type) {
        case C.LOGIN_USER: {
            return Object.assign({}, state, { userInfo: action.userInfo });
        }
        case C.LOGOUT_USER: {
            return Object.assign({}, state, { userInfo: null });
        }
        default: {
            return state;
        }
    }
}
