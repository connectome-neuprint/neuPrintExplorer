import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Immutable from 'immutable';

import * as pluginsActions from './plugins';
import C from '../reducers/constants';

const mockStore = configureStore([thunk]);

describe('plugins Actions', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });
  it('should create plugin response error action', () => {
    const expectedAction = {
      type: C.PLUGIN_RESPONSE_ERROR,
      error: 'PLUGIN RESPONSE ERROR: test'
    };
    expect(pluginsActions.pluginResponseError('test')).toEqual(expectedAction);
  });

  it('should check for cached data and miss.', () => {
    fetch.mockResponse(JSON.stringify({ data: [['1:2:3']] }));
    const store = mockStore({
      results: Immutable.Map({
        allResults: Immutable.List([])
      })
    });

    const plugin = {
      fetchParameters: () => ''
    };

    store
      .dispatch(pluginsActions.fetchData({pm: {foo: 1}}, plugin, 0))
      .then(() => {
        expect(fetch).toBeCalled();
        const actions = store.getActions();
        expect(actions[0].type).toEqual('PLUGIN_SUBMITTING');
        expect(actions[1].type).toEqual('PLUGIN_SAVE_RESPONSE');
      })
  });


  it ('should iissue cache hit if it finds cached data.', () => {
    fetch.mockResponse(JSON.stringify({ data: [['1:2:3']] }));

    const store = mockStore({
      results: Immutable.Map({
        allResults: Immutable.List([{params: { pm: {}}}])
      })
    });

    const plugin = {
      fetchParameters: () => ''
    };

    store
      .dispatch(pluginsActions.fetchData({pm: {}}, plugin, 0))
      .then(() => {
        // expect(fetch).not.toBeCalled();
        const actions = store.getActions();
        expect(actions[0].type).toEqual('PLUGIN_CACHE_HIT');
      })

  });

  it('should create submit form error action', () => {
    const expectedAction = {
      type: C.PLUGIN_SUBMIT_ERROR,
      tabIndex: 0,
      error: 'test'
    };
    expect(pluginsActions.formError('test')).toEqual(expectedAction);
  });
});
