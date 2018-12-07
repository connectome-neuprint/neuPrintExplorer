import C from './constants';
import query from './query';

// TODO: rewrite using Immutable once we get rid of callback function in neoQueryObj
const state = {
  neoQueryObj: {
    queryStr: 'existingquerystring',
    state: 'existingstate'
  },
  isQuerying: false,
  neoResults: 'existingneoresults',
  neoError: 'existingneoerror'
};

// note: can't test equality of functions
describe('query Reducer', () => {
  it('UPDATE_QUERY success', () => {
    const action = {
      type: C.UPDATE_QUERY,
      neoQueryObj: {
        queryStr: 'newquery',
        callback: '[Function callback]',
        state: {
          datasetstr: 'newdataset'
        }
      },
      isQuerying: true
    };
    expect(query(undefined, JSON.parse(JSON.stringify(action)))).toEqual({
      neoQueryObj: {
        queryStr: 'newquery',
        callback: '[Function callback]',
        state: {
          datasetstr: 'newdataset'
        }
      },
      isQuerying: true,
      neoResults: null,
      neoError: null
    });
    expect(query(state, JSON.parse(JSON.stringify(action)))).toEqual({
      neoQueryObj: {
        queryStr: 'newquery',
        callback: '[Function callback]',
        state: {
          datasetstr: 'newdataset'
        }
      },
      isQuerying: true,
      neoResults: 'existingneoresults',
      neoError: 'existingneoerror'
    });
  });

  it('SET_QUERY_STATUS success', () => {
    const action = {
      type: C.SET_QUERY_STATUS,
      isQuerying: true
    };
    expect(JSON.parse(JSON.stringify(query(undefined, action)))).toEqual({
      neoQueryObj: {
        queryStr: '',
        state: null
      },
      isQuerying: true,
      neoResults: null,
      neoError: null
    });
    expect(JSON.parse(JSON.stringify(query(state, action)))).toEqual({
      neoQueryObj: {
        queryStr: 'existingquerystring',
        state: 'existingstate'
      },
      isQuerying: true,
      neoResults: 'existingneoresults',
      neoError: 'existingneoerror'
    });
  });

  it('SET_NEO_ERROR success', () => {
    const action = {
      type: C.SET_NEO_ERROR,
      neoError: 'newerror'
    };
    expect(JSON.parse(JSON.stringify(query(undefined, action)))).toEqual({
      neoQueryObj: {
        queryStr: '',
        state: null
      },
      isQuerying: false,
      neoResults: null,
      neoError: 'newerror'
    });
    expect(JSON.parse(JSON.stringify(query(state, action)))).toEqual({
      neoQueryObj: {
        queryStr: 'existingquerystring',
        state: 'existingstate'
      },
      isQuerying: false,
      neoResults: null,
      neoError: 'newerror'
    });
  });

  it('FINISH_QUERY success', () => {
    const action = {
      type: C.FINISH_QUERY
    };
    expect(JSON.parse(JSON.stringify(query(undefined, action)))).toEqual({
      neoQueryObj: {
        queryStr: '',
        state: null
      },
      isQuerying: false,
      neoResults: null,
      neoError: null
    });
    expect(JSON.parse(JSON.stringify(query(state, action)))).toEqual({
      neoQueryObj: {
        queryStr: 'existingquerystring',
        state: 'existingstate'
      },
      isQuerying: false,
      neoResults: 'existingneoresults',
      neoError: null
    });
  });

  it('PLUGIN_SUBMIT success', () => {
    const action = {
      type: C.PLUGIN_SUBMIT,
      query: 'testQuery'
    };
    expect(JSON.parse(JSON.stringify(query(undefined, action)))).toEqual({
      neoQueryObj: {
        queryStr: '',
        state: null
      },
      isQuerying: false,
      neoResults: null,
      neoError: null,
      currentQuery: 'testQuery'
    });
    expect(JSON.parse(JSON.stringify(query(state, action)))).toEqual({
      neoQueryObj: {
        queryStr: 'existingquerystring',
        state: 'existingstate'
      },
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
      neoQueryObj: {
        queryStr: '',
        state: null
      },
      isQuerying: true,
      neoResults: null,
      neoError: null
    });
    expect(JSON.parse(JSON.stringify(query(state, action)))).toEqual({
      neoQueryObj: {
        queryStr: 'existingquerystring',
        state: 'existingstate'
      },
      isQuerying: true,
      neoResults: 'existingneoresults',
      neoError: 'existingneoerror'
    });
  });

  it('PLUGIN_SUBMIT_ERROR success', () => {
    const action = {
      type: C.PLUGIN_SUBMIT_ERROR
    };
    expect(JSON.parse(JSON.stringify(query(undefined, action)))).toEqual({
      neoQueryObj: {
        queryStr: '',
        state: null
      },
      isQuerying: false,
      neoResults: null,
      neoError: null
    });
    expect(JSON.parse(JSON.stringify(query(state, action)))).toEqual({
      neoQueryObj: {
        queryStr: 'existingquerystring',
        state: 'existingstate'
      },
      isQuerying: false,
      neoResults: 'existingneoresults',
      neoError: 'existingneoerror'
    });
  });

  it('PLUGIN_SAVE_RESPONSE success', () => {
    const action = {
      type: C.PLUGIN_SAVE_RESPONSE
    };
    expect(JSON.parse(JSON.stringify(query(undefined, action)))).toEqual({
      neoQueryObj: {
        queryStr: '',
        state: null
      },
      isQuerying: false,
      neoResults: null,
      neoError: null
    });
    expect(JSON.parse(JSON.stringify(query(state, action)))).toEqual({
      neoQueryObj: {
        queryStr: 'existingquerystring',
        state: 'existingstate'
      },
      isQuerying: false,
      neoResults: 'existingneoresults',
      neoError: 'existingneoerror'
    });
  });
});
