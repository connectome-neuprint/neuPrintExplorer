/*
 * Store for query results.
 */

import Immutable from 'immutable';
import C from './constants';

const resultsState = Immutable.Map({
  allResults: Immutable.List([]),
  loading: false,
  loadingError: null,
});

export default function resultsReducer(state = resultsState, action) {
  switch (action.type) {
    case C.PLUGIN_SUBMITTING: {
      return state.set('loading', true)
        .setIn(['allResults', action.tab], {
          result: null,
          params: null
        })
        .set('loadingError', null);
    }
    case C.CLEAR_NEW_RESULT: {
      return state.removeIn(['allResults', action.index]);
    }
    case C.PLUGIN_CACHE_HIT: {
      return state.set('loading': false)
        .set('loadingError', null);
    }
    case C.PLUGIN_SAVE_RESPONSE: {
      return state.setIn(['allResults', action.tabIndex], {
        result: action.response,
        params: action.params
      })
        .set('loading', false)
        .set('loadingError', null);
    }
    case C.UPDATE_QUERY: {
      return state.setIn(['allResults', action.index], action.queryObject);
    }
    case C.PLUGIN_SUBMIT_ERROR: {
      return state.removeIn(['allResults', action.tabIndex])
        .set('loading', false)
        .set('loadingError', action.error);
    }
    default: {
      return state;
    }
  }
}
