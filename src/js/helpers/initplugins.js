/*
 * Loads plugin modules and names from plugin directory.
 */

import { initPlugins, initViewPlugins } from 'actions/app';

// search the plugins directory and load all the files found there.
const pluginList = [];
const viewPlugins = {};

const extQueries = require.context('../plugins/query', false, /^(?!.*\.test\.jsx?$)\.\/(.*)\.jsx?$/);
const extViews = require.context('../plugins/views', true, /.jsx?$/);

// load the external view plugins
extViews.keys().forEach(key => {
  // get plugin name from file name
  const nameMatch = key.match(/^(?!.*\.test\.jsx?$)\.\/(.*)\.jsx?$/);
  if (nameMatch) {
    const pluginName = nameMatch[1];
    viewPlugins[pluginName] = extViews(key).default;
  }
});

extQueries.keys().forEach(key => {
  pluginList.unshift(extQueries(key).default);
});

// load all the plugins into the redux store
export default function loadPlugins(store) {
  store.dispatch(initPlugins(pluginList));
  store.dispatch(initViewPlugins(viewPlugins));
}
