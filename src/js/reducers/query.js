/*
 * Stores information related to Neo4j queries.
*/

"use strict";

var queryState = {
    neoQuery: "",
    isQuerying: false,
    neoResults: null,
    neoError: null,
}

export default function queryReducer(state = queryState, action) {
    switch(action.type) {
        case 'UPDATE_QUERY' : {
            return Object.assign({}, state, {neoQuery: action.neoQuery, isQuerying: true});
        }
        case 'SET_QUERY_STATUS' : {
            return Object.assign({}, state, {isQuerying: action.isQuerying});
        }
        case 'SET_NEO_ERROR' : {
            return Object.assign({}, state, {neoError: action.neoError, isQuerying: false, neoResults: null});
        }
        case 'SET_NEO_RESULTS' : {
            return Object.assign({}, state, {neoResults: action.neoResults, isQuerying: false, neoError: null});
        }
        default: {
            return state;
        }
    }
}
