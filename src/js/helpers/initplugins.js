/*
 * Loads plugin modules and names from plugin directory.
 */

import { initPlugins, initViewPlugins } from 'actions/app';

// search the plugins directory and load all the files found there.
const pluginList = [];
const plugins = require('@neuprint/queries');
const viewPlugins = require('@neuprint/views');

const extQueries = require.context('../../../plugins/', true, /.jsx?$/);
const extViews = require.context('../../../view-plugins/', true, /.jsx?$/);

// load the external view plugins
extViews.keys().forEach(key => {
  // get plugin name from file name
  const nameMatch = key.match(/^(?!.*\.test\.jsx?$)\.\/(.*)\.jsx?$/);
  if (nameMatch) {
    const pluginName = nameMatch[1];
    viewPlugins[pluginName] = extViews(key).default;
  }
});

// load the core query plugins
Object.keys(plugins).forEach(key => {
  pluginList.push(plugins[key]);
});
// load the external query plugins
extQueries.keys().forEach(key => {
  pluginList.unshift(extQueries(key).default);
});

// load all the plugins into the redux store
export default function loadPlugins(store) {
  store.dispatch(initPlugins(pluginList));
  store.dispatch(initViewPlugins(viewPlugins));
}
