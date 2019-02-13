import Immutable from 'immutable';
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
     const updated = state.deleteIn(['neurons', action.id]);

      if (updated.get('neurons').size < 1) {
        return updated.set('cameraPosition', null).set('display', false);
      }

      return updated;
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
