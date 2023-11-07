import Immutable from 'immutable';
import C from './constants';
import neo4jsettings from './neo4jsettings';

const state = Immutable.Map({
  availableDatasets: ['existingdataset'],
  availableROIs: { rois: ['existingrois'] },
  superROIs: {},
  datasetInfo: {
    lastmod: 'existinglastmod',
    uuid: 'existingversion'
  },
  meshInfo: {},
  roiInfo: {},
  columnDefaults: null,
  columnDefaultsLoaded: false,
  neoServer: 'foobar',
  publicState: false,
  publicStateLoaded: false
});

const initialState = Immutable.Map({
  availableDatasets: [],
  availableROIs: {},
  superROIs: {},
  datasetInfo: {},
  meshInfo: {},
  roiInfo: {},
  columnDefaults: null,
  columnDefaultsLoaded: false,
  neoServer: '',
  publicState: false,
  publicStateLoaded: false
});

describe('neo4jsettings Reducer', () => {
  it('SET_NEO_DATASETS success', () => {
    const action = {
      type: C.SET_NEO_DATASETS,
      availableDatasets: ['newdataset'],
      availableROIs: { rois: ['newrois'] },
      superROIs: {},
      datasetInfo: {
        lastmod: 'newlastmod',
        uuid: 'newversion'
      }
    };
    expect(neo4jsettings(undefined, action)).toEqual(
      Immutable.Map({
        availableDatasets: ['newdataset'],
        availableROIs: { rois: ['newrois'] },
        superROIs: {},
        datasetInfo: {
          lastmod: 'newlastmod',
          uuid: 'newversion'
        },
        meshInfo: {},
        roiInfo: {},
        columnDefaults: null,
        columnDefaultsLoaded: false,
        neoServer: '',
        publicState: false,
        publicStateLoaded: false
      })
    );
    expect(neo4jsettings(state, action)).toEqual(
      Immutable.Map({
        availableDatasets: ['newdataset'],
        availableROIs: { rois: ['newrois'] },
        superROIs: {},
        datasetInfo: {
          lastmod: 'newlastmod',
          uuid: 'newversion'
        },
        meshInfo: {},
        roiInfo: {},
        columnDefaults: null,
        columnDefaultsLoaded: false,
        neoServer: 'foobar',
        publicState: false,
        publicStateLoaded: false
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
