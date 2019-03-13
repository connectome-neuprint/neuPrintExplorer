import C from '../reducers/constants';

export function skeletonAddandOpen(id, dataSet) {
  return {
    type: C.SKELETON_ADD_ID,
    id,
    dataSet
  };
}

export function skeletonRemove(id, dataSet) {
  return {
    type: C.SKELETON_REMOVE,
    id,
    dataSet
  };
}
