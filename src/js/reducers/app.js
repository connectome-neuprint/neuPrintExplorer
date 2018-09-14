/*
 * Store high-level app state.
*/

"use strict";

import C from "./constants";
import Immutable from 'immutable';

const appState = Immutable.Map({
    pluginList: Immutable.List([]),
    reconIndex: 9999999,
    urlQueryString: window.location.search.substring(1),
    appDB: "",
    activePlugins: Immutable.Map({}),
});

export default function appReducer(state = appState, action) {
    if (state === undefined) {
        return appState;
    }

    switch (action.type) {
        case C.INIT_PLUGINS:
            return state.set("pluginList", action.pluginList).set("reconIndex", action.reconIndex);
        case C.SET_URL_QS:
            return state.set("urlQueryString", action.urlQueryString);
        case C.ACTIVATE_PLUGIN: {
            const id = action.uuid;
            const dataElement = Immutable.Map({
                data: action.data,
                query: action.query,
                viz: action.viz,
            });
            return state.setIn(["activePlugins", id], dataElement);
        }
        case C.DEACTIVATE_PLUGIN: 
            return state.deleteIn(["activePlugins", action.uuid]);
        case C.SET_APP_DB:
            return state.set("appDB", action.appDB);
        default:
            return state;
    }
}
