import Immutable from 'immutable';
import C from './constants';
import reducer from './app';

const state = Immutable.Map({
  pluginList: ['existingplugin'],
  urlQueryString: 'existingstring',
  appDB: 'existingDB',
  fullscreen: false,
  activePlugins: Immutable.Map({
    existingplugin: Immutable.Map({
      data: 'data',
      viz: 'viz',
      query: 'query'
    })
  }),
  selectedResult: 0
});

describe('app Reducer', () => {
  it('INIT_PLUGINS success', () => {
    const action = {
      type: C.INIT_PLUGINS,
      pluginList: ['test'],
    };
    expect(reducer(undefined, action)).toEqual(
      Immutable.Map({
        pluginList: ['test'],
        urlQueryString: window.location.search.substring(1),
        appDB: '',
        fullscreen: false,
        activePlugins: Immutable.Map({}),
        viewPlugins: Immutable.Map({}),
        selectedResult: 0
      })
    );
    expect(reducer(state, action)).toEqual(
      Immutable.Map({
        pluginList: ['test'],
        urlQueryString: 'existingstring',
        appDB: 'existingDB',
        fullscreen: false,
        activePlugins: Immutable.Map({
          existingplugin: Immutable.Map({
            data: 'data',
            viz: 'viz',
            query: 'query'
          })
        }),
        selectedResult: 0
      })
    );
  });

  it('SET_URL_QS success', () => {
    const action = {
      type: C.SET_URL_QS,
      urlQueryString: 'teststring'
    };
    expect(reducer(undefined, action)).toEqual(
      Immutable.Map({
        pluginList: [],
        urlQueryString: 'teststring',
        appDB: '',
        fullscreen: false,
        activePlugins: Immutable.Map({}),
        viewPlugins: Immutable.Map({}),
        selectedResult: 0
      })
    );
    expect(reducer(state, action)).toEqual(
      Immutable.Map({
        pluginList: ['existingplugin'],
        urlQueryString: 'teststring',
        appDB: 'existingDB',
        fullscreen: false,
        activePlugins: Immutable.Map({
          existingplugin: Immutable.Map({
            data: 'data',
            viz: 'viz',
            query: 'query'
          })
        }),
        selectedResult: 0
      })
    );
  });

  it('ACTIVATE_PLUGIN success', () => {
    const action = {
      type: C.ACTIVATE_PLUGIN,
      data: 'newdata',
      query: 'newquery',
      viz: 'newviz',
      uuid: 'a'
    };
    const newDataElement = Immutable.Map({
      data: action.data,
      query: action.query,
      viz: action.viz
    });
    expect(reducer(undefined, action)).toEqual(
      Immutable.Map({
        pluginList: [],
        urlQueryString: window.location.search.substring(1),
        appDB: '',
        fullscreen: false,
        activePlugins: Immutable.Map({
          a: newDataElement
        }),
        viewPlugins: Immutable.Map({}),
        selectedResult: 0
      })
    );
    expect(reducer(state, action)).toEqual(
      Immutable.Map({
        pluginList: ['existingplugin'],
        urlQueryString: 'existingstring',
        appDB: 'existingDB',
        fullscreen: false,
        activePlugins: Immutable.Map({
          existingplugin: Immutable.Map({
            data: 'data',
            viz: 'viz',
            query: 'query'
          }),
          a: newDataElement
        }),
        selectedResult: 0
      })
    );
  });

  it('DEACTIVATE_PLUGIN success', () => {
    const action = {
      type: C.DEACTIVATE_PLUGIN,
      uuid: 'existingplugin'
    };
    expect(reducer(state, action)).toEqual(
      Immutable.Map({
        pluginList: ['existingplugin'],
        urlQueryString: 'existingstring',
        appDB: 'existingDB',
        fullscreen: false,
        activePlugins: Immutable.Map({}),
        selectedResult: 0
      })
    );
  });
});
