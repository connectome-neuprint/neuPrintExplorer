/*
 * Loads plugin modules and names from plugin directory.
*/

import { initPlugins, initViewPlugins } from 'actions/app';

// import plugins (could probably write a pre-processing script)
import CommonConnectivity from 'plugins/CommonConnectivity.react';
import FreeForm from 'plugins/FreeForm.react';
import SimpleConnections from 'plugins/SimpleConnections.react';
import RankedTable from 'plugins/RankedTable.react';
import FindNeurons from 'plugins/FindNeurons';
import ROIsIntersectingNeurons from 'plugins/ROIsIntersectingNeurons.react';
import ROIConnectivity from 'plugins/ROIConnectivity.react';
import NeuronMeta from 'plugins/NeuronMeta.react';
import Autapses from 'plugins/Autapses';
import Distribution from 'plugins/Distribution.react';
import Completeness from 'plugins/Completeness.react';
import FindSimilarNeurons from 'plugins/FindSimilarNeurons.react';

// view plugins
import SimpleTable from 'views/SimpleTable';

const pluginList = [FindNeurons, NeuronMeta, ROIConnectivity, RankedTable, SimpleConnections, ROIsIntersectingNeurons, CommonConnectivity, FindSimilarNeurons, FreeForm, Autapses, Distribution, Completeness];

const viewPlugins = {
  SimpleTable,
}
export default function loadPlugins(store) {
    store.dispatch(initPlugins(pluginList));
    store.dispatch(initViewPlugins(viewPlugins));
}

