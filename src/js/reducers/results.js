/*
 * Store for query results.
 */

import Immutable from 'immutable';
import C from './constants';

const resultsState = Immutable.Map({
  allResults: Immutable.List([]),
  loading: false,
  loadingError: Immutable.List([]),
  showCypher: false,
});

export default function resultsReducer(state = resultsState, action) {
  switch (action.type) {
    case C.PLUGIN_SUBMITTING: {
      return state.set('loading', true)
        .setIn(['allResults', action.tab], {
          result: null,
          params: null,
          timestamp: ''
        })
        .setIn(['loadingError', action.tab], null);
    }
    case C.CLEAR_NEW_RESULT: {
      return state.removeIn(['allResults', action.index])
        .removeIn(['loadingError', action.index]);
    }
    case C.PLUGIN_CACHE_HIT: {
      return state.set('loading', false)
    }
    case C.PLUGIN_SAVE_RESPONSE: {
      return state.setIn(['allResults', action.tabIndex], {
        result: action.response,
        params: action.params,
        timestamp: (new Date()).getTime()
      })
        .set('loading', false)
        .setIn(['loadingError', action.tabIndex], null);
    }
    case C.UPDATE_QUERY: {
      return state.setIn(['allResults', action.index], action.queryObject);
    }
    case C.PLUGIN_SUBMIT_ERROR: {
      return state.setIn(['allResults', action.tabIndex], {})
        .set('loading', false)
        .setIn(['loadingError', action.tabIndex], action.error);
    }
    case C.REFRESH_RESULT: {
      return state.setIn(['allResults', action.index], {});
    }
    case C.TOGGLE_CYPHER_DISPLAY: {
      return state.set('showCypher', !state.get('showCypher'));
    }
    case C.CLEAR_CACHE: {
      return state.set('allResults', Immutable.List([]));
    }
    default: {
      return state;
    }
  }
}
