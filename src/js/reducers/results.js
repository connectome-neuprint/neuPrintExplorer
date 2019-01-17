/*
 * Store for query results.
*/

import Immutable from 'immutable';
import C from './constants';

const resultsState = Immutable.Map({
  clearIndices: new Set(),
  numClear: 0,
  allResults: Immutable.List([]),
});

export default function resultsReducer(state = resultsState, action) {
  switch (action.type) {
    case C.CLEAR_NEW_RESULT: {
      return state.removeIn(['allResults', action.index]);
    }
    case C.PLUGIN_SAVE_RESPONSE: {
      return state.updateIn(['allResults'], results => results.unshift(action.combined));
    }
    default: {
      return state;
    }
  }
}
