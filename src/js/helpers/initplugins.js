/*
 * Loads plugin modules and names from plugin directory.
*/

"use strict";

// import plugins (could probably write a pre-processing script)
import FreeForm from '../components/plugins/FreeForm.react';
import SimpleConnections from '../components/plugins/SimpleConnections.react';
import RankedTable from '../components/plugins/RankedTable.react';
import NeuronsInROIs from '../components/plugins/NeuronsInROIs.react';
import ROIsIntersectingNeurons from '../components/plugins/ROIsIntersectingNeurons.react';

const pluginList = [NeuronsInROIs, SimpleConnections, RankedTable, ROIsIntersectingNeurons, FreeForm];

export default function loadPlugins(store) {
    store.dispatch({type: 'INIT_PLUGINS', pluginList: pluginList});
}

