/*
 * Loads plugin modules and names from plugin directory.
*/

import { initPlugins, initViewPlugins } from 'actions/app';

// import plugins (could probably write a pre-processing script)
import CommonConnectivity from 'plugins/CommonConnectivity';
import CustomQuery from 'plugins/CustomQuery';
import SimpleConnections from 'plugins/SimpleConnections.react';
import RankedTable from 'plugins/RankedTable.react';
import FindNeurons from 'plugins/FindNeurons';
import ROIsIntersectingNeurons from 'plugins/ROIsIntersectingNeurons.react';
import ROIConnectivity from 'plugins/ROIConnectivity';
import NeuronMeta from 'plugins/NeuronMeta';
import Autapses from 'plugins/Autapses';
import PartnerCompleteness from 'plugins/PartnerCompleteness';
import Distribution from 'plugins/Distribution';
import Completeness from 'plugins/Completeness';
import FindSimilarNeurons from 'plugins/FindSimilarNeurons';

// view plugins
import SimpleTable from 'views/SimpleTable';
import CollapsibleTable from 'views/CollapsibleTable';
import PartnerCompletenessView from 'views/PartnerCompletenessView';
import HeatMapTable from 'views/HeatMapTable';

const pluginList = [
  FindNeurons,
  NeuronMeta,
  ROIConnectivity,
  RankedTable,
  SimpleConnections,
  ROIsIntersectingNeurons,
  CommonConnectivity,
  FindSimilarNeurons,
  CustomQuery,
  Autapses,
  Distribution,
  Completeness,
  PartnerCompleteness
];

const viewPlugins = {
  SimpleTable,
  PartnerCompletenessView,
  HeatMapTable,
  CollapsibleTable,
};
export default function loadPlugins(store) {
  store.dispatch(initPlugins(pluginList));
  store.dispatch(initViewPlugins(viewPlugins));
}
