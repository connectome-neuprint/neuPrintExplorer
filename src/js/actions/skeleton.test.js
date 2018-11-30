import * as skeletonActions from './skeleton';
import C from '../reducers/constants';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Immutable from 'immutable';

jest.mock('randomcolor', () => {
  return jest.fn().mockImplementation(() => '#4286f4');
});

const mockStore = configureStore([thunk]);
let store;

describe('skeleton Actions', () => {
  beforeEach(() => {
    fetch.resetMocks();
    store = mockStore({});
  });
  it('should create open skeleton action', () => {
    const expectedAction = {
      type: C.SKELETON_OPEN
    };
    expect(skeletonActions.skeletonOpen()).toEqual(expectedAction);
  });
  it('should create close skeleton action', () => {
    const expectedAction = {
      type: C.SKELETON_CLOSE
    };
    expect(skeletonActions.skeletonClose()).toEqual(expectedAction);
  });
  it('should create function to toggle skeleton depending on display state', () => {
    const toggleFunction = skeletonActions.toggleSkeleton();

    const storeDisplayFalse = mockStore({ skeleton: Immutable.Map({ display: false }) });

    // open
    toggleFunction(storeDisplayFalse.dispatch, storeDisplayFalse.getState);
    let dispatchedActions = storeDisplayFalse.getActions();
    expect(dispatchedActions.length).toBe(1);
    expect(dispatchedActions).toContainEqual({ type: C.SKELETON_OPEN });

    // close
    const storeDisplayTrue = mockStore({ skeleton: Immutable.Map({ display: true }) });
    toggleFunction(storeDisplayTrue.dispatch, storeDisplayTrue.getState);
    dispatchedActions = storeDisplayTrue.getActions();
    expect(dispatchedActions.length).toBe(1);
    expect(dispatchedActions).toContainEqual({ type: C.SKELETON_CLOSE });
  });
  it('should dispatch actions to add a skeleton', () => {
    fetch.mockResponse(JSON.stringify({ data: [[0, 1, 2, 3, 4, -1], [1, 1, 2, 3, 4, 0]] }));

    const asyncAddSkeleton = skeletonActions.skeletonAdd('testId', 'testDataset');
    asyncAddSkeleton(store.dispatch).then(() => {
      // fetches coordinates via api
      expect(window.fetch).toHaveBeenCalledTimes(1);

      const actions = store.getActions();

      expect(actions).toContainEqual({
        type: C.SKELETON_NEURON_LOADING,
        id: 'testId'
      });
      expect(actions).toContainEqual({
        type: C.SKELETON_ADD,
        id: 'testId',
        dataSet: 'testDataset',
        swc: {
          '0': { parent: -1, radius: 4, x: 1, y: 2, z: 3 },
          '1': { parent: 0, radius: 4, x: 1, y: 2, z: 3 }
        },
        color: '#4286f4'
      });
      expect(actions.length).toBe(2);
    });
  });
  it('should ', () => {
    fetch.mockResponses(
      JSON.stringify({ data: [[0, 1, 2, 3, 4, -1], [1, 1, 2, 3, 4, 0]] }),
      JSON.stringify({ data: [['1:2:3']] })
    );

    jest.spyOn(skeletonActions, 'skeletonAdd');
    const addAndOpenAsync = skeletonActions.skeletonAddandOpen('testId', 'testDataset');

    addAndOpenAsync(store.dispatch);

    expect(store.getActions()).toContainEqual({
      type: C.SKELETON_NEURON_LOADING,
      id: 'testId'
    });

    expect(store.getActions()).toContainEqual({ type: C.SKELETON_OPEN });
  });
  it('should create action to remove skeleton', () => {
    const expectedAction = {
      type: C.SKELETON_REMOVE
    };
    expect(skeletonActions.skeletonRemove()).toEqual(expectedAction);
  });
  it('should create action to show skeleton', () => {
    const expectedAction = {
      type: C.SKELETON_NEURON_SHOW
    };
    expect(skeletonActions.skeletonNeuronShow()).toEqual(expectedAction);
  });
  it('should create action to hide skeleton', () => {
    const expectedAction = {
      type: C.SKELETON_NEURON_HIDE
    };
    expect(skeletonActions.skeletonNeuronHide()).toEqual(expectedAction);
  });
  it('should toggle skeleton hide or show depending on visibility', () => {
    const toggleFunction = skeletonActions.skeletonNeuronToggle('testId');

    const storeVisibleFalse = mockStore({
      skeleton: Immutable.Map({}).setIn(['neurons', 'testId', 'visible'], false)
    });

    // show
    toggleFunction(storeVisibleFalse.dispatch, storeVisibleFalse.getState);
    let dispatchedActions = storeVisibleFalse.getActions();
    expect(dispatchedActions.length).toBe(1);
    expect(dispatchedActions).toContainEqual({ type: C.SKELETON_NEURON_SHOW, id: 'testId' });

    // hide
    const mockStoreVisibleTrue = mockStore({
      skeleton: Immutable.Map({}).setIn(['neurons', 'testId', 'visible'], true)
    });
    toggleFunction(mockStoreVisibleTrue.dispatch, mockStoreVisibleTrue.getState);
    dispatchedActions = mockStoreVisibleTrue.getActions();
    expect(dispatchedActions.length).toBe(1);
    expect(dispatchedActions).toContainEqual({ type: C.SKELETON_NEURON_HIDE, id: 'testId' });
  });
});
