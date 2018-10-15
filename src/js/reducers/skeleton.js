import C from './constants';
import Immutable from 'immutable';

var skeletonState = Immutable.Map({
  display: false,
  neurons: Immutable.Map({}),
});

/* Neuron structure should be:
 * {
 *   name: <string>
 *   visible: <boolean>
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
        visible: true
      }));
    }
    case C.SKELETON_REMOVE: {
      return state.deleteIn(['neurons', action.id]);
    }
    case C.SKELETON_NEURON_SHOW: {
      return state.setIn(['neurons', action.id, 'visible'], true);
    }
    case C.SKELETON_NEURON_HIDE: {
      return state.setIn(['neurons', action.id, 'visible'], false);
    }
    default: {
      return state;
    }
  }
}
