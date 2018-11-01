/*
 * Loads plugin modules and names from plugin directory.
*/

import { initPlugins, initViewPlugins } from '../actions/app';

// import plugins (could probably write a pre-processing script)
import CommonConnectivity from '../components/plugins/CommonConnectivity.react';
import FreeForm from '../components/plugins/FreeForm.react';
import SimpleConnections from '../components/plugins/SimpleConnections.react';
import RankedTable from '../components/plugins/RankedTable.react';
import FindNeurons from '../components/plugins/FindNeurons.react';
import ROIsIntersectingNeurons from '../components/plugins/ROIsIntersectingNeurons.react';
import ROIConnectivity from '../components/plugins/ROIConnectivity.react';
import NeuronMeta from '../components/plugins/NeuronMeta.react';
import Autapses from '../components/plugins/Autapses.react';
import Distribution from '../components/plugins/Distribution.react';
import Completeness from '../components/plugins/Completeness.react';
import FindSimilarNeurons from '../components/plugins/FindSimilarNeurons.react';
import TestPlugin from '../components/plugins/TestPlugin';

// view plugins
import SimpleTable from '../components/view-plugins/SimpleTable';

const pluginList = [FindNeurons, NeuronMeta, ROIConnectivity, RankedTable, SimpleConnections, ROIsIntersectingNeurons, CommonConnectivity, FindSimilarNeurons, FreeForm, Autapses, Distribution, Completeness, TestPlugin];

const viewPlugins = {
  SimpleTable,
}
export default function loadPlugins(store) {
    store.dispatch(initPlugins(pluginList));
    store.dispatch(initViewPlugins(viewPlugins));
}

