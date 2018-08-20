/*
 * Store for query results.
*/

"use strict";

import C from "./constants"

var resultsState = {
    allTables: null,
    clearIndices: new Set(),
    numClear: 0
}

export default function resultsReducer(state = resultsState, action) {
    switch (action.type) {
        case C.UPDATE_RESULTS: {
            return Object.assign({}, state, { allTables: [action.allTables], clearIndices: new Set(), numClear: 0 });
        }
        case C.APPEND_RESULTS: {
            if (state.allTables !== null) {
                return Object.assign({}, state, { allTables: [...state.allTables.slice(0, state.allTables.size), action.allTables] });
            } else {
                return Object.assign({}, state, { allTables: [action.allTables] });
            }
        }
        case C.CLEAR_RESULT: {
            if ((state.allTables !== null) && (state.allTables.length > action.index)) {
                let indices = new Set(state.clearIndices);
                indices.add(action.index);
                return Object.assign({}, state, { clearIndices: indices, numClear: indices.size });
            }

            return state;
        }
        default: {
            return state;
        }
    }
}
