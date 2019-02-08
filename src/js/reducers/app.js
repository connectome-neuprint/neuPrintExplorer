/*
 * Store high-level app state.
 */
import Immutable from 'immutable';
import C from './constants';

const appState = Immutable.Map({
  pluginList: [],
  urlQueryString: window.location.search.substring(1),
  appDB: '',
  fullscreen: false,
  viewPlugins: Immutable.Map({}),
  selectedResult: 0
});

export default function appReducer(state = appState, action) {
  switch (action.type) {
    case C.INIT_PLUGINS:
      return state.set('pluginList', action.pluginList);
    case C.INIT_VIEWPLUGINS:
      return state.set('viewPlugins', Immutable.Map(action.plugins));
    case C.SET_APP_DB:
      return state.set('appDB', action.appDB);
    case C.SET_FULLSCREEN_VIEWER:
      return state.set('fullscreen', true);
    case C.CLEAR_FULLSCREEN_VIEWER:
      return state.set('fullscreen', false);
    case C.APP_SET_SELECTED_RESULT:
      return state.set('selectedResult', action.index);
    case C.SKELETON_OPEN:
      return state.set('selectedResult', -2);
    case C.PLUGIN_SAVE_RESPONSE:
      return state.set('selectedResult', 0);
    default:
      return state;
  }
}
