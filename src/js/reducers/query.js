/*
 * Stores information related to Neo4j queries.
*/
import C from "./constants"

var queryState = {
    neoQueryObj: {
        queryStr: "",
        callback: function () { },
        state: null,
        params: undefined,
    },
    isQuerying: false,
    neoResults: null,
    neoError: null,
}

export default function queryReducer(state = queryState, action) {
    switch (action.type) {
        case C.UPDATE_QUERY: {
            return Object.assign({}, state, { neoQueryObj: action.neoQueryObj, isQuerying: true });
        }
        case C.SET_QUERY_STATUS: {
            return Object.assign({}, state, { isQuerying: action.isQuerying });
        }
        case C.SET_NEO_ERROR: {
            return Object.assign({}, state, { neoError: action.neoError, isQuerying: false, neoResults: null });
        }
        case C.FINISH_QUERY: {
            return Object.assign({}, state, { isQuerying: false, neoError: null });
        }
        case C.PLUGIN_SUBMIT: {
            return Object.assign({}, state, { currentQuery: action.query });
        }
        default: {
            return state;
        }
    }
}
