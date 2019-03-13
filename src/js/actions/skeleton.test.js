import * as skeletonActions from './skeleton';
import C from '../reducers/constants';

describe('skeleton Actions', () => {
  it('should dispatch actions to add a skeleton', () => {
    const expectedAction = {
      type: C.SKELETON_ADD_ID
    };
    expect(skeletonActions.skeletonAddandOpen()).toEqual(expectedAction);
  });
  it('should create action to remove skeleton', () => {
    const expectedAction = {
      type: C.SKELETON_REMOVE
    };
    expect(skeletonActions.skeletonRemove()).toEqual(expectedAction);
  });
});
