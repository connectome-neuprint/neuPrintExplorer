import C from './constants';
import Immutable from 'immutable';

var neuroglancerState = Immutable.Map({
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
    case C.NEUROGLANCER_NEURON_ADD: {
      return state.setIn(['neurons', action.id], Immutable.Map({
        id: action.id,
        color: action.color,
        dataSet: action.dataSet,
        visible: true
      })).set('coordinates', Immutable.List(action.coordinates)).set('loading', false);
    }
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
