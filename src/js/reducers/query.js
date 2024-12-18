/*
 * Stores information related to Neo4j queries.
 */
import Immutable from 'immutable';
import { setQueryString, getQueryObject } from 'helpers/queryString';

import C from './constants';

const queryState = Immutable.Map({
  isQuerying: false,
  tabs: Immutable.List([])
});

function createFindNeuronsQuery(data) {
  const current = getQueryObject('qr', []);
  current.push({
    code: 'fn',
    ds: data.dataset,
    pm: {
      dataset: data.dataset,
      neuron_name: data.id,
    },
    visProps: { rowsPerPage: 25 }
  });

  const newQuery = {
    qr: current,
    tab: current.length - 1
  };
  return newQuery;
}

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
    case C.ADD_AND_OPEN_QUERY: {
      if (action.query === "FindNeurons") {
        // add the neuron to the query string
        const newQuery = createFindNeuronsQuery(action.data);
        setQueryString(newQuery);
      }
      return state;
    }
    default: {
      return state;
    }
  }
}
