/*
 * Store high-level app state.
*/

"use strict";

import C from "./constants"

var appState = {
    pluginList: [],
    reconIndex: 9999999,
    urlQueryString: window.location.search.substring(1),
    appDB: "",
}

export default function appReducer(state = appState, action) {
    if (state === undefined) {
        return appState;
    }

    switch (action.type) {
        case C.INIT_PLUGINS: {
            return Object.assign({}, state, { pluginList: action.pluginList, reconIndex: action.reconIndex });
        }
        case C.SET_URL_QS: {
            return Object.assign({}, state, { urlQueryString: action.urlQueryString });
        }
        case C.SET_APP_DB: {
            return Object.assign({}, state, { appDB: action.appDB });
        }
        default: {
            return state;
        }
    }
}
