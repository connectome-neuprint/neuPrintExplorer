import Immutable from 'immutable';

import C from './constants';
import reducer from './results';

const state = Immutable.Map({
  allResults: Immutable.List([{ existingResult: 'testResult' }]),
  clearIndices: new Set(),
  numClear: 0
});

describe('results Reducer', () => {
  it('CLEAR_NEW_RESULT success', () => {
    const action = {
      type: C.CLEAR_NEW_RESULT,
      index: 0
    };
    expect(reducer(undefined, action)).toEqual(
      Immutable.Map({
        allResults: Immutable.List([]),
        clearIndices: new Set(),
        numClear: 0
      })
    );
    expect(reducer(state, action)).toEqual(
      Immutable.Map({
        clearIndices: new Set(),
        allResults: Immutable.List([]),
        numClear: 0
      })
    );
  });

  it('PLUGIN_SAVE_RESPONSE success', () => {
    const action = {
      type: C.PLUGIN_SAVE_RESPONSE,
      combined: {
        dataSet: 'hemibrain',
        queryString: 'testQueryString',
        visType: 'testVisType',
        result: { columns: ['a', 'b'], data: [1, 2] }
      }
    };
    expect(reducer(undefined, action)).toEqual(
      Immutable.Map({
        allResults: Immutable.List([
          {
            dataSet: 'hemibrain',
            queryString: 'testQueryString',
            visType: 'testVisType',
            result: { columns: ['a', 'b'], data: [1, 2] }
          }
        ]),
        clearIndices: new Set(),
        numClear: 0
      })
    );
    expect(reducer(state, action)).toEqual(
      Immutable.Map({
        clearIndices: new Set(),
        allResults: Immutable.List([
          {
            dataSet: 'hemibrain',
            queryString: 'testQueryString',
            visType: 'testVisType',
            result: { columns: ['a', 'b'], data: [1, 2] }
          },
          { existingResult: 'testResult' }
        ]),
        numClear: 0
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
