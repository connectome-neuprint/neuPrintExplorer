import Immutable from 'immutable';
import C from './constants';
import reducer from './app';

const state = Immutable.Map({
  pluginList: ['existingplugin'],
  urlQueryString: 'existingstring',
  appDB: 'existingDB',
  fullscreen: false,
  selectedResult: 0
});

describe('app Reducer', () => {
  it('INIT_PLUGINS success', () => {
    const action = {
      type: C.INIT_PLUGINS,
      pluginList: ['test']
    };
    expect(reducer(undefined, action)).toEqual(
      Immutable.Map({
        pluginList: ['test'],
        urlQueryString: window.location.search.substring(1),
        appDB: '',
        fullscreen: false,
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
        selectedResult: 0
      })
    );
  });
});
