import Immutable from 'immutable';
import { setQueryString, getQueryObject } from 'helpers/queryString';
import C from './constants';

const neuroglancerState = Immutable.Map({
  display: false,
  neurons: Immutable.Map({}),
  layers: Immutable.Map({}),
  coordinates: Immutable.List([]),
  loading: false,
  error: null,
});

/* Neuron structure should be:
 * {
 *   name: <string>
 *   visible: <boolean>
 * }
 */


export default function neuroglancerReducer(state = neuroglancerState, action) {
  switch (action.type) {
    case C.NEUROGLANCER_OPEN: {
      return state.set('display', true);
    }
    case C.NEUROGLANCER_CLOSE: {
      return state.set('display', false);
    }
    case C.NEUROGLANCER_LAYER_ADD: {
      return state.setIn(['layers', action.dataSet], Immutable.Map({
        uuid: action.uuid,
        dataSet: action.dataSet,
        host: action.host,
        dataType: action.dataType,
        dataInstance: action.dataInstance,
      })).set('layer_loading', false);
    }
    case C.NEUROGLANCER_LAYER_REMOVE: {
      return state.deleteIn(['layers', action.id]);
    }
    case C.NEUROGLANCER_LAYER_LOADING: {
      return state.set('layer_loading', true);
    }
    case C.NEUROGLANCER_LAYER_LOAD_ERROR: {
      return state.set('layer_loading', false).set('error', action.error);
    }
    case C.NEUROGLANCER_ADD_ID: {
      // grab the tab data
      const current = getQueryObject('qr', []);

      // need to find the index of the tab we are going to update / replace.
      let selectedIndex = -1;
      let selected = null;

      // find existing neuroglancer tab
      current.forEach((tab, index) => {
        if (tab.code === 'ng') {
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
          code: 'ng',
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
    case C.NEUROGLANCER_NEURON_ADD: {
      return state.setIn(['neurons', action.id], Immutable.Map({
        id: action.id,
        color: action.color,
        dataSet: action.dataSet,
        visible: true
      })).set('coordinates', Immutable.List(action.coordinates)).set('loading', false);
    }
    case C.SKELETON_REMOVE:
    case C.NEUROGLANCER_NEURON_REMOVE: {
     const updated = state.deleteIn(['neurons', action.id]);

      if (updated.get('neurons').size < 1) {
        return updated.set('display', false);
      }
      return updated;
    }
    case C.NEUROGLANCER_NEURON_LOADING: {
      return state.set('loading', true);
    }
    case C.NEUROGLANCER_NEURON_LOAD_ERROR: {
      return state.set('loading', false).set('error', action.error);
    }
    case C.NEUROGLANCER_NEURON_SHOW: {
      return state.setIn(['neurons', action.id, 'visible'], true);
    }
    case C.NEUROGLANCER_NEURON_HIDE: {
      return state.setIn(['neurons', action.id, 'visible'], false);
    }
    default: {
      return state;
    }
  }
}
