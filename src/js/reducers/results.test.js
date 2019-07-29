import Immutable from 'immutable';
import timekeeper from 'timekeeper';

import C from './constants';
import reducer from './results';

const state = Immutable.Map({
  allResults: Immutable.List([{ existingResult: 'testResult' }]),
  loadingError: Immutable.List([]),
  loading: false,
  showCypher: false,
});

describe('results Reducer', () => {
  let time;
  beforeEach(() => {
    time = new Date();
    timekeeper.freeze(time);
  });

  afterEach(() => {
    timekeeper.reset(time);
  });

  it('CLEAR_NEW_RESULT success', () => {
    const action = {
      type: C.CLEAR_NEW_RESULT,
      index: 0
    };
    expect(reducer(undefined, action)).toEqual(
      Immutable.Map({
        allResults: Immutable.List([]),
        loadingError: Immutable.List([]),
        loading: false,
        showCypher: false
      })
    );
    expect(reducer(state, action)).toEqual(
      Immutable.Map({
        allResults: Immutable.List([]),
        loadingError: Immutable.List([]),
        loading: false,
        showCypher: false
      })
    );
  });

  it('PLUGIN_SAVE_RESPONSE success', () => {
    const action = {
      type: C.PLUGIN_SAVE_RESPONSE,
      tabIndex: 0,
      response: { columns: ['a', 'b'], data: [1, 2] },
      params: {
        dataSet: 'hemibrain',
        queryString: 'testQueryString',
        visType: 'testVisType'
      }
    };
    expect(reducer(undefined, action)).toEqual(
      Immutable.Map({
        allResults: Immutable.List([{
          params: {
            dataSet: 'hemibrain',
            queryString: 'testQueryString',
            visType: 'testVisType'
          },
          result: { columns: ['a', 'b'], data: [1, 2] },
          timestamp: time.getTime()
        }]),
        loading: false,
        loadingError: Immutable.List([null]),
        showCypher: false
      })
    );
    expect(reducer(state, action)).toEqual(
      Immutable.Map({
        allResults: Immutable.List([{
          params: {
            dataSet: 'hemibrain',
            queryString: 'testQueryString',
            visType: 'testVisType',
          },
          result: { columns: ['a', 'b'], data: [1, 2] },
          timestamp: time.getTime()
        }]),
        loading: false,
        loadingError: Immutable.List([null]),
        showCypher: false
      })
    );
  });
  it('UPDATE_QUERY success', () => {
    const action = {
      type: C.UPDATE_QUERY,
      index: 1,
      queryObject: { queryString: 'testQuery2', visProps: { rowsPerPage: 10 } }
    };
    const prevState = Immutable.Map({
      allResults: Immutable.List([
        { queryString: 'testQuery1' },
        { queryString: 'testQuery2', visProps: { rowsPerPage: 5 } }
      ])
    });
    expect(reducer(prevState, action)).toEqual(
      prevState.setIn(['allResults', 1], {
        queryString: 'testQuery2',
        visProps: { rowsPerPage: 10 }
      })
    );
  });
});
