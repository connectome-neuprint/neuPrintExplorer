import * as pluginsActions from './plugins';
import C from '../reducers/constants';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

const mockStore = configureStore([thunk]);
let store;

describe('plugins Actions', () => {
  beforeEach(() => {
    fetch.resetMocks();
    store = mockStore({});
  });
  it('should create plugin response error action', () => {
    const expectedAction = {
      type: C.PLUGIN_RESPONSE_ERROR,
      error: 'PLUGIN RESPONSE ERROR: test'
    };
    expect(pluginsActions.pluginResponseError('test')).toEqual(expectedAction);
  });
  it('should dispatch submit query', () => {
    fetch.mockResponse(JSON.stringify({ data: [['1:2:3']] }));
    // TODO: check that submission errors are sent correctly

    const query = {
      queryStr: '/testcall',
      parameters: { p: 'test' },
      processResults: jest.fn((query, response) => {
        return { data: [['1:2:3']] };
      })
    };
    const submitAsync = pluginsActions.submit(query);
    submitAsync(store.dispatch).then(() => {
      expect(window.fetch).toHaveBeenCalledTimes(1);

      const actions = store.getActions();

      expect(actions).toContainEqual({
        type: C.PLUGIN_SUBMITTING,
        query
      });

      const combined = Object.assign(query, {
        result: { data: [['1:2:3']] }
      });
      expect(actions).toContainEqual({
        type: C.PLUGIN_SAVE_RESPONSE,
        combined
      });
      expect(actions.length).toBe(2);
    });
  });
  it('should dispatch submit for custom queries', () => {
    fetch.mockResponse(JSON.stringify({ data: [['1:2:3']] }));

    // custom query
    const customQuery = {
      cypherQuery: 'testCypherQuery',
      parameters: { p: 'test' },
      processResults: jest.fn((query, response) => {
        return { data: [['1:2:3']] };
      })
    };
    const submitAsync = pluginsActions.submit(customQuery);
    submitAsync(store.dispatch).then(() => {
      expect(window.fetch).toHaveBeenCalledTimes(1);

      const actions = store.getActions();

      expect(actions).toContainEqual({
        type: C.PLUGIN_SUBMITTING,
        query: Object.assign(
          customQuery,
          Object.assign(customQuery.parameters, { cypherQuery: customQuery.cypherQuery })
        )
      });

      const combined = Object.assign(customQuery, {
        result: { data: [['1:2:3']] }
      });
      expect(actions).toContainEqual({
        type: C.PLUGIN_SAVE_RESPONSE,
        combined
      });

      expect(actions.length).toBe(2);
    });
  });
  it('should create submit form error action', () => {
    const expectedAction = {
      type: C.PLUGIN_SUBMIT_ERROR,
      error: 'test'
    };
    expect(pluginsActions.formError('test')).toEqual(expectedAction);
  });
});
