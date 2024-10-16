import * as actions from './skeleton';
import C from '../reducers/constants';

describe('Skeleton actions', () => {

  test('should dispatch skeletonAddandOpen correctly', () => {
    const id = 'test-id';
    const dataSet = 'test-dataSet';
    const tabIndex = 1;
    const color = '#ff0000';

    // Expected action object
    const expectedAction = {
      type: C.SKELETON_ADD_ID,
      id,
      dataSet,
      tabIndex,
      color
    };

    // Call the action creator
    const result = actions.skeletonAddandOpen(id, dataSet, tabIndex, color);

    // Check if the action matches the expected structure
    expect(result).toEqual(expectedAction);
  });

  test('should dispatch skeletonAddBodiesandOpen correctly', () => {
    const bodies = { 'test-id-1': '#ff0000', 'test-id-2': null };
    const dataSet = 'test-dataSet';
    const tabIndex = 1;
    const options = { replace: true };

    // Expected action object
    const expectedAction = {
      type: C.SKELETON_ADD_BODIES,
      bodies,
      dataSet,
      tabIndex,
      options
    };

    // Call the action creator
    const result = actions.skeletonAddBodiesandOpen(bodies, dataSet, tabIndex, options);

    // Check if the action matches the expected structure
    expect(result).toEqual(expectedAction);
  });

  test('should dispatch skeletonRemove correctly', () => {
    const id = 'test-id';
    const dataSet = 'test-dataSet';
    const tabIndex = 1;

    // Expected action object
    const expectedAction = {
      type: C.SKELETON_REMOVE,
      id,
      dataSet,
      tabIndex
    };

    // Call the action creator
    const result = actions.skeletonRemove(id, dataSet, tabIndex);

    // Check if the action matches the expected structure
    expect(result).toEqual(expectedAction);
  });

  test('should dispatch skeletonClear correctly', () => {
    const dataSet = 'test-dataSet';
    const tabIndex = 1;

    // Expected action object
    const expectedAction = {
      type: C.SKELETON_CLEAR,
      dataSet,
      tabIndex
    };

    // Call the action creator
    const result = actions.skeletonClear(dataSet, tabIndex);

    // Check if the action matches the expected structure
    expect(result).toEqual(expectedAction);
  });
});

