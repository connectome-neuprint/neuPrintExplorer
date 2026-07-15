import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
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
      fetchParameters: () => '',
      details: {
        displayName: 'test'
      }
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


  it ('should issue cache hit if it finds cached data.', () => {
    fetch.mockResponse(JSON.stringify({ data: [['1:2:3']] }));

    const store = mockStore({
      results: Immutable.Map({
        allResults: Immutable.List([{params: { pm: {}}}])
      })
    });

    const plugin = {
      fetchParameters: () => '',
      details: {
        displayName: 'test'
      }
    };

    store
      .dispatch(pluginsActions.fetchData({pm: {}}, plugin, 0))
      .then(() => {
        // expect(fetch).not.toBeCalled();
        const actions = store.getActions();
        expect(actions[0].type).toEqual('PLUGIN_CACHE_HIT');
      })

  });

  it('should surface a TOS-required response as a submit error.', () => {
    fetch.mockResponse(JSON.stringify({
      tos_required: true,
      message: 'Accept the dataset Terms of Service first'
    }));
    const store = mockStore({
      results: Immutable.Map({
        allResults: Immutable.List([])
      })
    });
    const plugin = {
      fetchParameters: () => '',
      details: {
        displayName: 'test'
      }
    };

    return store
      .dispatch(pluginsActions.fetchData({pm: {}}, plugin, 0))
      .then(() => {
        const actions = store.getActions();
        expect(actions.map(action => action.type)).toEqual([
          C.PLUGIN_SUBMITTING,
          C.PLUGIN_SUBMIT_ERROR
        ]);
        expect(actions[1].error.message).toEqual('Accept the dataset Terms of Service first');
        expect(actions.some(action => action.type === C.PLUGIN_SAVE_RESPONSE)).toBe(false);
      });
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
