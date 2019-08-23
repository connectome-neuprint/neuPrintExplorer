import C from '../reducers/constants';

export function skeletonAddandOpen(id, dataSet) {
  return {
    type: C.SKELETON_ADD_ID,
    id,
    dataSet
  };
}

export function skeletonRemove(id, dataSet, tabIndex) {
  return {
    type: C.SKELETON_REMOVE,
    id,
    dataSet,
    tabIndex
  };
}

export function toggleSynapse(bodyId, synapseId, isInput) {
  return {
    type: C.SKELETON_SYNAPSE_TOGGLE,
    synapseId,
    bodyId,
    isInput
  };
}

export function toggleSpindle(tabIndex) {
  return {
    type: C.SKELETON_SPINDLE_TOGGLE,
    tabIndex
  };
}
