import * as skeletonActions from './skeleton';
import C from '../reducers/constants';

describe('skeleton Actions', () => {
  it('should dispatch actions to add a skeleton', async () => {
    const expectedAction = {
      type: C.SKELETON_ADD_ID,
    };
    // have to wait for the pouchdb code to load or the test throws a warning
    // about imports.
    // eslint-disable-next-line no-promise-executor-return
    await new Promise((r) => setTimeout(r, 1000));
    expect(await skeletonActions.skeletonAddandOpen()).toEqual(expectedAction);
  });
  it('should create action to remove skeleton', async () => {
    const expectedAction = {
      type: C.SKELETON_REMOVE,
    };
    expect(await skeletonActions.skeletonRemove()).toEqual(expectedAction);
  });
});
