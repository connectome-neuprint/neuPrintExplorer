import Immutable from 'immutable';
import C from './constants';
import query from './query';

// TODO: rewrite using Immutable once we get rid of callback function in neoQueryObj
const state = Immutable.Map({
  dataSet: null,
  isQuerying: false,
  neoResults: 'existingneoresults',
  neoError: 'existingneoerror',
  currentQuery: null
});

// note: can't test equality of functions
describe('query Reducer', () => {
  it('SET_QUERY_STATUS success', () => {
    const action = {
      type: C.SET_QUERY_STATUS,
      isQuerying: true
    };
    expect(JSON.parse(JSON.stringify(query(undefined, action)))).toEqual({
      dataSet: null,
      isQuerying: true,
      neoResults: null,
      neoError: null,
      currentQuery: null
    });
    expect(JSON.parse(JSON.stringify(query(state, action)))).toEqual({
      dataSet: null,
      isQuerying: true,
      neoResults: 'existingneoresults',
      neoError: 'existingneoerror',
      currentQuery: null
    });
  });

  it('SET_NEO_ERROR success', () => {
    const action = {
      type: C.SET_NEO_ERROR,
      neoError: 'newerror'
    };
    expect(JSON.parse(JSON.stringify(query(undefined, action)))).toEqual({
      dataSet: null,
      isQuerying: false,
      neoResults: null,
      neoError: 'newerror',
      currentQuery: null
    });
    expect(JSON.parse(JSON.stringify(query(state, action)))).toEqual({
      dataSet: null,
      isQuerying: false,
      neoResults: null,
      neoError: 'newerror',
      currentQuery: null
    });
  });

  it('FINISH_QUERY success', () => {
    const action = {
      type: C.FINISH_QUERY
    };
    expect(JSON.parse(JSON.stringify(query(undefined, action)))).toEqual({
      dataSet: null,
      isQuerying: false,
      neoResults: null,
      neoError: null,
      currentQuery: null
    });
    expect(JSON.parse(JSON.stringify(query(state, action)))).toEqual({
      dataSet: null,
      isQuerying: false,
      neoResults: 'existingneoresults',
      neoError: null,
      currentQuery: null
    });
  });

  it('PLUGIN_SUBMIT success', () => {
    const action = {
      type: C.PLUGIN_SUBMIT,
      query: 'testQuery'
    };
    expect(JSON.parse(JSON.stringify(query(undefined, action)))).toEqual({
      dataSet: null,
      isQuerying: false,
      neoResults: null,
      neoError: null,
      currentQuery: 'testQuery'
    });
    expect(JSON.parse(JSON.stringify(query(state, action)))).toEqual({
      dataSet: null,
      isQuerying: false,
      neoResults: 'existingneoresults',
      neoError: 'existingneoerror',
      currentQuery: 'testQuery'
    });
  });

  it('PLUGIN_SUBMITTING success', () => {
    const action = {
      type: C.PLUGIN_SUBMITTING
    };
    expect(JSON.parse(JSON.stringify(query(undefined, action)))).toEqual({
      dataSet: null,
      isQuerying: true,
      neoResults: null,
      neoError: null,
      currentQuery: null
    });
    expect(JSON.parse(JSON.stringify(query(state, action)))).toEqual({
      dataSet: null,
      isQuerying: true,
      neoResults: 'existingneoresults',
      neoError: 'existingneoerror',
      currentQuery: null
    });
  });

  it('PLUGIN_SUBMIT_ERROR success', () => {
    const action = {
      type: C.PLUGIN_SUBMIT_ERROR
    };
    expect(JSON.parse(JSON.stringify(query(undefined, action)))).toEqual({
      dataSet: null,
      isQuerying: false,
      neoResults: null,
      neoError: null,
      currentQuery: null
    });
    expect(JSON.parse(JSON.stringify(query(state, action)))).toEqual({
      dataSet: null,
      isQuerying: false,
      neoResults: 'existingneoresults',
      neoError: 'existingneoerror',
      currentQuery: null
    });
  });

  it('PLUGIN_SAVE_RESPONSE success', () => {
    const action = {
      type: C.PLUGIN_SAVE_RESPONSE
    };
    expect(JSON.parse(JSON.stringify(query(undefined, action)))).toEqual({
      dataSet: null,
      isQuerying: false,
      neoResults: null,
      neoError: null,
      currentQuery: null
    });
    expect(JSON.parse(JSON.stringify(query(state, action)))).toEqual({
      dataSet: null,
      isQuerying: false,
      neoResults: 'existingneoresults',
      neoError: 'existingneoerror',
      currentQuery: null
    });
  });
});
