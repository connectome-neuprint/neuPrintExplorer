import Immutable from 'immutable';
import { setQueryString, getQueryObject } from 'helpers/queryString';

import C from './constants';

const skeletonState = Immutable.Map({
  display: false,
  neurons: Immutable.Map({}),
  compartments: Immutable.Map({}),
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
    case C.SKELETON_OPEN: {
      return state.set('display', true);
    }
    case C.SKELETON_CLOSE: {
      return state.set('display', false);
    }
    case C.SKELETON_ADD_ID: {
      // grab the tab data
      const current = getQueryObject('qr', []);

      // need to find the index of the tab we are going to update / replace.
      let selectedIndex = -1;
      let selected = null;

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
      if (selectedIndex > 0) {
        const bodyIds = selected.pm.bodyIds.toString().split(',');
        // push the id into the bodyids list
        bodyIds.push(action.id);
        selected.pm.bodyIds = bodyIds.join(',');
        current[selectedIndex] = selected;
        setQueryString({
          tab: selectedIndex,
        });
      } else {
        // if none found, then add one to the querystring
        //   push the id into the bodyids list
        // set the tab value to that of the skeleton viewer.
        current.push({
          code: 'sk',
          ds: action.dataSet,
          pm: {
            dataSet: action.dataSet,
            skip: true,
            bodyIds: action.id
          }
        });
        setQueryString({
          tab: current.length - 1,
        });
      }

      setQueryString({
        qr: current
      });
      return state;
    }
    case C.SKELETON_ADD: {
      return state.setIn(['neurons', action.id], Immutable.Map({
        name: action.id,
        dataSet: action.dataSet,
        swc: action.swc,
        color: action.color,
        visible: true
      })).set('loading', false);
    }
    case C.SKELETON_REMOVE: {
      // grab the tab data
      const current = getQueryObject('qr', []);

      // need to find the index of the tab we are going to update / replace.
      let selectedIndex = -1;
      let selected = null;

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
      if (selectedIndex > 0) {
        const bodyIds = selected.pm.bodyIds.toString().split(',');
        // push the id into the bodyids list
        const updated = bodyIds.filter(id => id !== action.id);
        selected.pm.bodyIds = updated.join(',');
        current[selectedIndex] = selected;
        setQueryString({
          qr: current,
        });
      }
      return state;
    }
    case C.SKELETON_NEURON_LOADING: {
      return state.set('loading', true);
    }
    case C.SKELETON_NEURON_LOAD_ERROR: {
      return state.set('loading', false).set('error', action.error);
    }
    case C.SKELETON_NEURON_SHOW: {
      return state.setIn(['neurons', action.id, 'visible'], true);
    }
    case C.SKELETON_NEURON_HIDE: {
      return state.setIn(['neurons', action.id, 'visible'], false);
    }
    case C.SKELETON_SET_CAMERA_POSITION: {
      return state.set('cameraPosition', action.position);
    }
    case C.SKELETON_ADD_COMPARTMENT: {
      return state.setIn(['compartments', action.name], Immutable.Map({
        name: action.name,
        dataSet: action.dataSet,
        obj: action.obj,
        color: action.color,
        visible: true
      }));
    }
    case C.SKELETON_REMOVE_COMPARTMENT: {
      return state.deleteIn(['compartments', action.id]);
    }
    default: {
      return state;
    }
  }
}
