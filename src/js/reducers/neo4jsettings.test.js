import Immutable from 'immutable';
import C from './constants';
import neo4jsettings from './neo4jsettings';

const state = Immutable.Map({
  availableDatasets: ['existingdataset'],
  availableROIs: { rois: ['existingrois'] },
  datasetInfo: {
    lastmod: 'existinglastmod',
    uuid: 'existingversion'
  },
  neoServer: 'foobar'
});

const initialState = Immutable.Map({
  availableDatasets: [],
  availableROIs: {},
  datasetInfo: {},
  neoServer: ''
});

describe('neo4jsettings Reducer', () => {
  it('SET_NEO_DATASETS success', () => {
    const action = {
      type: C.SET_NEO_DATASETS,
      availableDatasets: ['newdataset'],
      availableROIs: { rois: ['newrois'] },
      datasetInfo: {
        lastmod: 'newlastmod',
        uuid: 'newversion'
      }
    };
    expect(neo4jsettings(undefined, action)).toEqual(
      Immutable.Map({
        availableDatasets: ['newdataset'],
        availableROIs: { rois: ['newrois'] },
        datasetInfo: {
          lastmod: 'newlastmod',
          uuid: 'newversion'
        },
        neoServer: ''
      })
    );
    expect(neo4jsettings(state, action)).toEqual(
      Immutable.Map({
        availableDatasets: ['newdataset'],
        availableROIs: { rois: ['newrois'] },
        datasetInfo: {
          lastmod: 'newlastmod',
          uuid: 'newversion'
        },
        neoServer: 'foobar'
      })
    );
  });
  it('SET_NEO_SERVER success', () => {
    const action = {
      type: C.SET_NEO_SERVER,
      neoServer: 'testServer'
    };
    expect(neo4jsettings(undefined, action)).toEqual(initialState.set('neoServer', 'testServer'));
  });
});
