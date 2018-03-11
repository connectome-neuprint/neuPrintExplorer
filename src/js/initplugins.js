/*
 * Loads plugin modules and names from plugin directory.
*/

"use strict";

import AppReducers from './reducers';


// import plugins (could probably write a pre-processing script)
import FreeForm from './components/plugins/FreeForm.react';

var pluginList = [FreeForm];

export default function loadPlugins(store) {
    store.dispatch({type: 'INIT_PLUGINS', pluginList: pluginList});
}

