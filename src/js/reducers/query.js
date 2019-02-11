/*
 * Stores information related to Neo4j queries.
 */
import Immutable from 'immutable';
import C from './constants';

const queryState = Immutable.Map({
  isQuerying: false
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
    default: {
      return state;
    }
  }
}
