/*
 * Stores configuration and other basic information for neo4j datasets.
*/
import Immutable from 'immutable';
import C from './constants';

const neo4jsettingsState = Immutable.Map({
  availableDatasets: [],
  availableROIs: {},
  superROIs: {},
  datasetInfo: {},
  meshInfo: {},
  neoServer: '',
  publicState: false
});

export default function neo4jreducer(state = neo4jsettingsState, action) {
  switch (action.type) {
    case C.SET_NEO_DATASETS: {
      return state
        .set('availableDatasets', action.availableDatasets)
        .set('availableROIs', action.availableROIs)
        .set('superROIs', action.superROIs)
        .set('datasetInfo', action.datasetInfo);
    }
    case C.SET_NEO_SERVER: {
      return state.set('neoServer', action.neoServer);
    }
    case C.SET_NEO_MESHINFO: {
      return state.set('meshInfo', action.dataSets);
    }
    case C.SET_NEO_SERVER_PUBLIC: {
      return state.set('publicState', action.publicState);
    }
    default: {
      return state;
    }
  }
}
