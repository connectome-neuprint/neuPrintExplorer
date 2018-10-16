import C from '../reducers/constants';

export function skeletonOpen() {
  return {
    type: C.SKELETON_OPEN,
  };
}

export function skeletonClose() {
  return {
    type: C.SKELETON_CLOSE,
  };
}
export function skeletonAdd(id) {
  return {
    type: C.SKELETON_ADD,
    id
  };
}
export function skeletonRemove(id) {
  return {
    type: C.SKELETON_REMOVE,
    id
  };
}
export function skeletonNeuronShow(id) {
  return {
    type: C.SKELETON_NEURON_SHOW,
    id
  };
}
export function skeletonNeuronHide(id) {
  return {
    type: C.SKELETON_NEURON_HIDE,
    id
  };
}
