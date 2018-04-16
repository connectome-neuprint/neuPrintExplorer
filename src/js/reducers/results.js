/*
 * Store for query results.
*/

"use strict";

var resultsState = {
    allTables: null,
    clearIndices: null,
    numClear: 0
}

export default function resultsReducer(state = resultsState, action) {
    switch(action.type) {
        case 'UPDATE_RESULTS' : {
            return Object.assign({}, state, {allTables: [action.allTables], clearIndices: new Set(), numClear: 0});
        }
        case 'APPEND_RESULTS' : {
            if (state.allTables !== null) {
                state.allTables.push(action.allTables);
                return state;
            } else {
                return Object.assign({}, state, {allTables: [action.allTables]});
            }
        }
        case 'CLEAR_RESULT' : {
            if ((state.allTables !== null) && (state.allTables.length > action.index)) {
                let indices = new Set(state.clearIndices);
                indices.add(action.index);
                return Object.assign({}, state, {clearIndices: indices, numClear: indices.size});
            }
        
            return state;
        }
        default: {
            return state;
        }
    }
}
