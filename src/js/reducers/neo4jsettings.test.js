import C from '../../../src/js/reducers/constants';
import reducer from '../../../src/js/reducers/neo4jsettings';
import Immutable from 'immutable';

const state = Immutable.Map({
  availableDatasets: ['existingdataset'],
  availableROIs: { rois: ['existingrois'] },
  datasetInfo: {
    lastmod: 'existinglastmod',
    uuid: 'existingversion'
  },
  neoServer: 'foobar'
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
    expect(reducer(undefined, action)).toEqual(
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
    expect(reducer(state, action)).toEqual(
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
});
