/*
 * Store high-level app state.
*/

"use strict";

var appState = {
    pluginList: [],
    reconIndex: 9999999,
    urlQueryString: window.location.search.substring(1),
}

export default function appReducer(state = appState, action) {
    if(state === undefined) {
        return appState;
    }

    switch(action.type) {
        case 'INIT_PLUGINS': {
            return Object.assign({}, state, {pluginList: action.pluginList, reconIndex: action.reconIndex});
        }
        case 'SET_URL_QS' : {
            return Object.assign({}, state, {urlQueryString: action.urlQueryString});
        }
        default: {
            return state;
        }
    }
}
