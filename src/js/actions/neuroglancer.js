import C from '../reducers/constants';

// eslint-disable-next-line import/prefer-default-export
export function neuroglancerAddandOpen(id, dataSet) {
  return {
    type: C.NEUROGLANCER_ADD_ID,
    id,
    dataSet
  };
}
