import Immutable from 'immutable';
import { setQueryString, getQueryObject } from 'helpers/queryString';

import C from './constants';

const skeletonState = Immutable.Map({
  display: false,
  neurons: Immutable.Map({}),
  compartments: Immutable.Map({}),
  synapses: Immutable.Map({}),
  loading: false,
  error: null,
  cameraPosition: null
});

/* Neuron structure should be:
 * {
 *   name: <string>
 *   visible: <boolean>
 *   swc: <string>
 * }
 */


export default function skeletonReducer(state = skeletonState, action) {
  switch (action.type) {
    case C.SKELETON_ADD_ID: {
      // grab the tab data
      const current = getQueryObject('qr', []);

      // need to find the index of the tab we are going to update / replace.
      let selectedIndex = action.tabIndex || -1;
      let selected = current[action.tabIndex];
      let ftab = null;

      // find existing skeletonviewer tab
      current.forEach((tab, index) => {
        if (tab.code === 'sk') {
          if (tab.ds === action.dataSet) {
            selectedIndex = index;
            selected = tab;
          }
        }
      });

      //   if dataSet is the same
      if (selectedIndex >= 0) {
        const bodyIds = selected.pm.bodyIds.toString().split(',');
        // push the id into the bodyids list
        bodyIds.push(action.id);
        selected.pm.bodyIds = bodyIds.join(',');
        current[selectedIndex] = selected;
        if (!action.tabIndex) {
          ftab = selectedIndex;
        }
      } else {
        // if none found, then add one to the querystring
        //   push the id into the bodyids list
        // set the tab value to that of the skeleton viewer.
        current.push({
          code: 'sk',
          ds: action.dataSet,
          pm: {
            dataset: action.dataSet,
            skip: true,
            bodyIds: action.id
          }
        });
        ftab = current.length - 1;
      }

      const newQuery = {
        qr: current
      };

      if (ftab) {
        newQuery.ftab = ftab;
      }

      setQueryString(newQuery);
      return state;
    }
    case C.SKELETON_REMOVE: {
      // grab the tab data
      const current = getQueryObject('qr', []);

      // need to find the index of the tab we are going to update / replace.
      const selected = current[action.tabIndex];

      if (selected) {
        const bodyIds = selected.pm.bodyIds.toString().split(',');
        // push the id into the bodyids list
        const updated = bodyIds.filter(id => id !== action.id);
        selected.pm.bodyIds = updated.join(',');
        current[action.tabIndex] = selected;
        setQueryString({
          qr: current,
        });
      }
      return state;
    }
    case C.SKELETON_SYNAPSE_LOADED: {
      const updated = state.setIn(['synapses', action.bodyId, action.synapseType, action.synapseId], {color: action.color, swc: action.data});
      return updated;
    }
    case C.SKELETON_SYNAPSE_REMOVE: {
      const synapseType = action.isInput ? 'inputs' : 'outputs';
      const updated = state.deleteIn(['synapses', action.bodyId, synapseType, action.synapseId]);
      return updated;
    }
    case C.SKELETON_SPINDLE_TOGGLE: {
       // grab the tab data
      const current = getQueryObject('qr', []);
      // need to find the index of the tab we are going to update / replace.
      const selected = current[action.tabIndex];

      if (selected) {
        // get current spindle display state
        const spindleState = selected.sp || 0;
        selected.sp = !spindleState ? 1 : 0;
        current[action.tabIndex] = selected;
        setQueryString({
          qr: current,
        });
      }
      return state;
    }
    case C.SKELETON_SYNAPSES_ON_TOP_TOGGLE: {
       // grab the tab data
       const current = getQueryObject('qr', []);
       // need to find the index of the tab we are going to update / replace.
       const selected = current[action.tabIndex];
 
       if (selected) {
         // get current display state
         const synapsesOnTopState = selected.sot || 0;
         selected.sot = !synapsesOnTopState ? 1 : 0;
         current[action.tabIndex] = selected;
         setQueryString({
           qr: current,
         });
       }
       return state;
     }

    default: {
      return state;
    }
  }
}
