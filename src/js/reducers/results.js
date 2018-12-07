/*
 * Store for query results.
*/

import Immutable from 'immutable';
import C from './constants';

const resultsState = {
  clearIndices: new Set(),
  numClear: 0,
  allResults: Immutable.List([]),
};

export default function resultsReducer(state = resultsState, action) {
  switch (action.type) {
    case C.CLEAR_NEW_RESULT: {
      const updated = state.allResults.remove(action.index);
      return Object.assign({}, state, { allResults: updated});
    }
    case C.PLUGIN_SAVE_RESPONSE: {
      const updated = state.allResults.unshift(action.combined);
      return Object.assign({}, state, { allResults: updated});
    }
    default: {
      return state;
    }
  }
}
