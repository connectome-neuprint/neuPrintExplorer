/*
 * Stores information related to Neo4j queries.
 */
import Immutable from 'immutable';
import C from './constants';

const queryState = Immutable.Map({
  dataSet: null,
  isQuerying: false,
  neoResults: null,
  neoError: null,
  currentQuery: null
});

export default function queryReducer(state = queryState, action) {
  switch (action.type) {
    case C.SET_QUERY_STATUS: {
      return state.set('isQuerying', action.isQuerying);
    }
    case C.SET_NEO_ERROR: {
      return state
        .set('neoError', action.neoError)
        .set('isQuerying', false)
        .set('neoResults', null);
    }
    case C.FINISH_QUERY: {
      return state.set('isQuerying', false).set('neoError', null);
    }
    case C.PLUGIN_SUBMIT: {
      return state.set('currentQuery', action.query);
    }
    case C.PLUGIN_SUBMITTING: {
      return state.set('isQuerying', true);
    }
    case C.PLUGIN_SUBMIT_ERROR:
    case C.PLUGIN_SAVE_RESPONSE: {
      return state.set('isQuerying', false);
    }
    default: {
      return state;
    }
  }
}
