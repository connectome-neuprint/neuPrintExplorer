/*
 * Stores configuration and other basic information for neo4j datasets.
*/
import C from './constants';
import Immutable from 'immutable';

var neo4jsettingsState = Immutable.Map({
  availableDatasets: [],
  availableROIs: {},
  datasetInfo: {},
  neoServer: ''
});

export default function neo4jreducer(state = neo4jsettingsState, action) {
  switch (action.type) {
    case C.SET_NEO_DATASETS: {
      return state
        .set('availableDatasets', action.availableDatasets)
        .set('availableROIs', action.availableROIs)
        .set('datasetInfo', action.datasetInfo);
    }
    case C.SET_NEO_SERVER: {
      return state.set(('neoServer', action.neoServer));
    }
    default: {
      return state;
    }
  }
}
