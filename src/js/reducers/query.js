/*
 * Stores information related to Neo4j queries.
*/

"use strict";

var queryState = {
    neoQueryObj: {
        queryStr: "",
        callback: function(){},
        state: null,
    },
    isQuerying: false,
    neoResults: null,
    neoError: null,
}

export default function queryReducer(state = queryState, action) {
    switch(action.type) {
        case 'UPDATE_QUERY' : {
            return Object.assign({}, state, {neoQueryObj: action.neoQueryObj, isQuerying: true});
        }
        case 'SET_QUERY_STATUS' : {
            return Object.assign({}, state, {isQuerying: action.isQuerying});
        }
        case 'SET_NEO_ERROR' : {
            return Object.assign({}, state, {neoError: action.neoError, isQuerying: false, neoResults: null});
        }
        case 'FINISH_QUERY' : {
            return Object.assign({}, state, {isQuerying: false, neoError: null});
        }
        default: {
            return state;
        }
    }
}
