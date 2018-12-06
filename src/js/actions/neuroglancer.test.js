import Immutable from 'immutable';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as neuroglancerActions from './neuroglancer';
import C from '../reducers/constants';

const mockStore = configureStore([thunk]);
let storeEmptyState;

describe('neuroglancer Actions', () => {
  beforeEach(() => {
    fetch.resetMocks();
    storeEmptyState = mockStore({});
  });
  it('should create an open neuroglancer action', () => {
    const expectedAction = { type: C.NEUROGLANCER_OPEN };
    expect(neuroglancerActions.neuroglancerOpen()).toEqual(expectedAction);
  });
  it('should create a close neuroglancer action', () => {
    const expectedAction = { type: C.NEUROGLANCER_CLOSE };
    expect(neuroglancerActions.neuroglancerClose()).toEqual(expectedAction);
  });
  it('should create a function for toggling neuroglancer', () => {
    const toggleFunction = neuroglancerActions.toggleNeuroglancer();

    const storeDisplayFalse = mockStore({ neuroglancer: Immutable.Map({ display: false }) });

    // open
    toggleFunction(storeDisplayFalse.dispatch, storeDisplayFalse.getState);
    let dispatchedActions = storeDisplayFalse.getActions();
    expect(dispatchedActions.length).toBe(1);
    expect(dispatchedActions).toContainEqual({ type: C.NEUROGLANCER_OPEN });

    // close
    const storeDisplayTrue = mockStore({ neuroglancer: Immutable.Map({ display: true }) });
    toggleFunction(storeDisplayTrue.dispatch, storeDisplayTrue.getState);
    dispatchedActions = storeDisplayTrue.getActions();
    expect(dispatchedActions.length).toBe(1);
    expect(dispatchedActions).toContainEqual({ type: C.NEUROGLANCER_CLOSE });
  });
  it('should dispatch actions to add a neuron', () => {
    fetch.mockResponse(JSON.stringify({ data: [['1:2:3']] }));

    const asyncAddNeuron = neuroglancerActions.neuroglancerAddNeuron('testId', 'testDataset');
    asyncAddNeuron(storeEmptyState.dispatch).then(() => {
      // fetches coordinates via api
      expect(window.fetch).toHaveBeenCalledTimes(1);

      const actions = storeEmptyState.getActions();

      expect(actions).toContainEqual({
        type: C.NEUROGLANCER_NEURON_COORDINATES_LOADING,
        id: 'testId'
      });
      expect(actions).toContainEqual({
        type: C.NEUROGLANCER_NEURON_ADD,
        id: 'testId',
        dataSet: 'testDataset',
        coordinates: '1:2:3',
        color: '#ffffff'
      });
      expect(actions.length).toBe(2);
    });
    // TODO: add test for failed response
  });
  it('should dispatch actions to add layer', () => {
    fetch.mockResponse(
      JSON.stringify({
        data: [
          [
            'testHostSeg',
            'testUuidSeg',
            'testInstanceSeg',
            'testHostGray',
            'testUuidGray',
            'testInstanceGray'
          ]
        ]
      })
    );

    const asyncAddLayer = neuroglancerActions.neuroglancerAddLayer('testId', 'testDataset');
    asyncAddLayer(storeEmptyState.dispatch).then(() => {
      // fetches data via api
      expect(window.fetch).toHaveBeenCalledTimes(1);

      const actions = storeEmptyState.getActions();

      expect(actions).toContainEqual({
        type: C.NEUROGLANCER_LAYER_LOADING,
        id: 'testId'
      });
      expect(actions).toContainEqual({
        type: C.NEUROGLANCER_LAYER_ADD,
        host: 'testHostGray',
        uuid: 'testUuidGray',
        dataInstance: 'testInstanceGray',
        dataType: 'image',
        dataSet: 'testDataset-grayscale'
      });
      expect(actions).toContainEqual({
        type: C.NEUROGLANCER_LAYER_ADD,
        host: 'testHostSeg',
        uuid: 'testUuidSeg',
        dataInstance: 'testInstanceSeg',
        dataType: 'segmentation',
        dataSet: 'testDataset'
      });
      expect(actions.length).toBe(3);
    });
    // TODO: add test for failed response
  });
  it('should dispatch layer, neuron, and open actions', () => {
    fetch.mockResponses(
      JSON.stringify({
        data: [
          [
            'testHostSeg',
            'testUuidSeg',
            'testInstanceSeg',
            'testHostGray',
            'testUuidGray',
            'testInstanceGray'
          ]
        ]
      }),
      JSON.stringify({ data: [['1:2:3']] })
    );

    jest.spyOn(neuroglancerActions, 'neuroglancerAddLayer');
    const addAndOpenAsync = neuroglancerActions.neuroglancerAddandOpen('testId', 'testDataset');

    addAndOpenAsync(storeEmptyState.dispatch);

    expect(storeEmptyState.getActions()).toContainEqual({
      type: 'NEUROGLANCER_LAYER_LOADING',
      id: 'testId'
    });
    expect(storeEmptyState.getActions()).toContainEqual({
      type: 'NEUROGLANCER_NEURON_COORDINATES_LOADING',
      id: 'testId'
    });
    expect(storeEmptyState.getActions()).toContainEqual({ type: 'NEUROGLANCER_OPEN' });
  });
  it('should dispatch remove action', () => {
    const expectedAction = { type: C.NEUROGLANCER_REMOVE, id: 'testId' };
    expect(neuroglancerActions.neuroglancerRemove('testId')).toEqual(expectedAction);
  });
  it('should dispatch show action', () => {
    const expectedAction = { type: C.NEUROGLANCER_NEURON_SHOW, id: 'testId' };
    expect(neuroglancerActions.neuroglancerNeuronShow('testId')).toEqual(expectedAction);
  });
  it('should dispatch hide action', () => {
    const expectedAction = { type: C.NEUROGLANCER_NEURON_HIDE, id: 'testId' };
    expect(neuroglancerActions.neuroglancerNeuronHide('testId')).toEqual(expectedAction);
  });
  it('should dispatch hide or show neuron action depending on state', () => {
    const toggleFunction = neuroglancerActions.neuroglancerNeuronToggle('testId');

    const storeVisibleFalse = mockStore({
      neuroglancer: Immutable.Map({}).setIn(['neurons', 'testId', 'visible'], false)
    });

    // show
    toggleFunction(storeVisibleFalse.dispatch, storeVisibleFalse.getState);
    let dispatchedActions = storeVisibleFalse.getActions();
    expect(dispatchedActions.length).toBe(1);
    expect(dispatchedActions).toContainEqual({ type: C.NEUROGLANCER_NEURON_SHOW, id: 'testId' });

    // hide
    const mockStoreVisibleTrue = mockStore({
      neuroglancer: Immutable.Map({}).setIn(['neurons', 'testId', 'visible'], true)
    });
    toggleFunction(mockStoreVisibleTrue.dispatch, mockStoreVisibleTrue.getState);
    dispatchedActions = mockStoreVisibleTrue.getActions();
    expect(dispatchedActions.length).toBe(1);
    expect(dispatchedActions).toContainEqual({ type: C.NEUROGLANCER_NEURON_HIDE, id: 'testId' });
  });
});
