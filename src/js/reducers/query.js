/*
 * Stores information related to Neo4j queries.
 */
import Immutable from 'immutable';
import C from './constants';

const queryState = Immutable.Map({
  isQuerying: false,
  tabs: Immutable.List([])
});

export default function queryReducer(state = queryState, action) {
  switch (action.type) {
    case C.PLUGIN_SUBMITTING: {
      return state.set('isQuerying', true);
    }
    case C.PLUGIN_SUBMIT_ERROR:
    case C.PLUGIN_SAVE_RESPONSE: {
      return state.set('isQuerying', false);
    }
    case C.QUERY_TYPE_TAB_TOGGLE: {
      return state.setIn(['tabs', action.id], action.status);
    }
    default: {
      return state;
    }
  }
}
