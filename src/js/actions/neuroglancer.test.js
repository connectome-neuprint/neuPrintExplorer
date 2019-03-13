import * as neuroglancerActions from './neuroglancer';
import C from '../reducers/constants';

describe('neuroglancer Actions', () => {
  it('should create an open neuroglancer action', () => {
    const expectedAction = { type: C.NEUROGLANCER_ADD_ID };
    expect(neuroglancerActions.neuroglancerAddandOpen()).toEqual(expectedAction);
  });
});
