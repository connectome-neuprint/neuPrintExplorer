/*
 * Loads plugin modules and names from plugin directory.
*/

import { initPlugins, initViewPlugins } from 'actions/app';

// search the plugins directory and load all the files found there.
const pluginList = [];
const plugins = require.context('../components/plugins/', true, /^(?!.*\.test\.jsx$).*\.jsx$/);
const viewPlugins = require.context('../components/view-plugins/', true, /^(?!.*\.test\.jsx$).*\.jsx$/);

plugins.keys().forEach(key => {
  pluginList.push(plugins(key).default);
});

// search the views directory and load all the plugins there
const viewPluginsMap = {}

viewPlugins.keys().forEach(key => {
  // get plugin name from file name
  const nameMatch = key.match(/^(?!.*\.test\.jsx$)\.\/(.*)\.jsx$/);
  if (nameMatch) {
    const pluginName = nameMatch[1];
    viewPluginsMap[pluginName] = viewPlugins(key).default;
  }
});

export default function loadPlugins(store) {
  store.dispatch(initPlugins(pluginList));
  store.dispatch(initViewPlugins(viewPluginsMap));
}
