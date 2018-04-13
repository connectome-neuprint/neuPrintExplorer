/*
 * Store for query results.
*/

"use strict";

var resultsState = {
    allTables: null,
}

export default function resultsReducer(state = resultsState, action) {
    switch(action.type) {
        case 'UPDATE_RESULTS' : {
            return Object.assign({}, state, {allTables: action.allTables});
        }
        default: {
            return state;
        }
    }
}
