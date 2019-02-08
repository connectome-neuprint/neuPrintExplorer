import Immutable from 'immutable';
import C from './constants';
import reducer from './app';

const state = Immutable.Map({
  pluginList: ['existingplugin'],
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
        appDB: '',
        fullscreen: false,
        viewPlugins: Immutable.Map({}),
        selectedResult: 0
      })
    );
    expect(reducer(state, action)).toEqual(
      Immutable.Map({
        pluginList: ['test'],
        appDB: 'existingDB',
        fullscreen: false,
        selectedResult: 0
      })
    );
  });
});
