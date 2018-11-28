import C from '../../../src/js/reducers/constants';
import neuroglancer from './neuroglancer';
import Immutable from 'immutable';

const initialState = Immutable.Map({
  display: false,
  neurons: Immutable.Map({}),
  layers: Immutable.Map({}),
  coordinates: Immutable.List([]),
  loading: false,
  error: null
});

describe('neuroglancer Reducer', () => {
  it('NEUROGLANCER_OPEN sucess', () => {
    const action = {
      type: C.NEUROGLANCER_OPEN
    };
    const results = neuroglancer(initialState, action);
    expect(results).toEqual(initialState.set('display', true));
  });

  it('NEUROGLANCER_CLOSE success', () => {
    const action = {
      type: C.NEUROGLANCER_CLOSE
    };
    const results = neuroglancer(initialState.set('display', true), action);
    expect(results).toEqual(initialState);
  });

  it('NEUROGLANCER_LAYER_ADD success', () => {
    const action = {
      type: C.NEUROGLANCER_LAYER_ADD,
      dataSet: 'testDataset',
      uuid: 'testUUID',
      host: 'testHost',
      dataType: 'testDataType',
      dataInstance: 'testInstance'
    };
    const results = neuroglancer(initialState, action);
    expect(results).toEqual(
      initialState
        .setIn(
          ['layers', 'testDataset'],
          Immutable.Map({
            dataSet: 'testDataset',
            uuid: 'testUUID',
            host: 'testHost',
            dataType: 'testDataType',
            dataInstance: 'testInstance'
          })
        )
        .set('layer_loading', false)
    );
  });

  it('NEUROGLANCER_LAYER_REMOVE success', () => {
    const action = {
      type: C.NEUROGLANCER_LAYER_REMOVE,
      id: 'testDataset'
    };
    const results = neuroglancer(
      initialState.setIn(
        ['layers', 'testDataset'],
        Immutable.Map({
          dataSet: 'testDataset',
          uuid: 'testUUID',
          host: 'testHost',
          dataType: 'testDataType',
          dataInstance: 'testInstance'
        })
      ),
      action
    );
    expect(results).toEqual(initialState);
  });

  it('NEUROGLANCER_LAYER_LOADING success', () => {
    const action = {
      type: C.NEUROGLANCER_LAYER_LOADING
    };
    const results = neuroglancer(initialState, action);
    expect(results).toEqual(initialState.set('layer_loading', true));
  });

  it('NEUROGLANCER_LAYER_LOAD_ERROR success', () => {
    const action = {
      type: C.NEUROGLANCER_LAYER_LOAD_ERROR,
      error: 'testError'
    };
    const results = neuroglancer(initialState.set('layer_loading', true), action);
    expect(results).toEqual(initialState.set('error', 'testError').set('layer_loading', false));
  });

  it('NEUROGLANCER_NEURON_ADD success', () => {
    const action = {
      type: C.NEUROGLANCER_NEURON_ADD,
      id: 'testId',
      color: 'testColor',
      dataSet: 'testDataset',
      coordinates: [1, 2, 3]
    };
    const results = neuroglancer(initialState.set('loading', true), action);
    expect(results).toEqual(
      initialState
        .setIn(
          ['neurons', 'testId'],
          Immutable.Map({
            id: 'testId',
            color: 'testColor',
            dataSet: 'testDataset',
            visible: true
          })
        )
        .set('coordinates', Immutable.List([1, 2, 3]))
        .set('loading', false)
    );
  });

  it('NEUROGLANCER_NEURON_REMOVE success', () => {
    const action = {
      type: C.NEUROGLANCER_NEURON_REMOVE,
      id: 'testId'
    };
    const results = neuroglancer(
      initialState
        .setIn(
          ['neurons', 'testId'],
          Immutable.Map({
            id: 'testId',
            color: 'testColor',
            dataSet: 'testDataset',
            visible: true
          })
        )
        .set('display', true),
      action
    );
    expect(results).toEqual(initialState);

    const removeNeuronWithExistingNeuron = neuroglancer(
      initialState
        .setIn(
          ['neurons', 'testId'],
          Immutable.Map({
            id: 'testId',
            color: 'testColor',
            dataSet: 'testDataset',
            visible: true
          })
        )
        .setIn(
          ['neurons', 'existingId'],
          Immutable.Map({
            id: 'existingId',
            color: 'existingColor',
            dataSet: 'existingDataset',
            visible: true
          })
        )
        .set('display', true),
      action
    );
    expect(removeNeuronWithExistingNeuron).toEqual(
      initialState
        .setIn(
          ['neurons', 'existingId'],
          Immutable.Map({
            id: 'existingId',
            color: 'existingColor',
            dataSet: 'existingDataset',
            visible: true
          })
        )
        .set('display', true)
    );
  });

  it('NEUROGLANCER_NEURON_LOADING success', () => {
    const action = {
      type: C.NEUROGLANCER_NEURON_LOADING
    };
    const results = neuroglancer(initialState, action);
    expect(results).toEqual(initialState.set('loading', true));
  });

  it('NEUROGLANCER_NEURON_LOAD_ERROR success', () => {
    const action = {
      type: C.NEUROGLANCER_NEURON_LOAD_ERROR,
      error: 'testError'
    };
    const results = neuroglancer(initialState.set('loading', true), action);
    expect(results).toEqual(initialState.set('error', 'testError'));
  });

  it('NEUROGLANCER_NEURON_SHOW success', () => {
    const action = {
      type: C.NEUROGLANCER_NEURON_SHOW,
      id: 'testId'
    };
    const results = neuroglancer(initialState, action);
    expect(results).toEqual(initialState.setIn(['neurons', 'testId', 'visible'], true));
  });

  it('NEUROGLANCER_NEURON_HIDE success', () => {
    const action = {
      type: C.NEUROGLANCER_NEURON_HIDE,
      id: 'testId'
    };
    const results = neuroglancer(
      initialState.setIn(['neurons', 'testId', 'visible'], true),
      action
    );
    expect(results).toEqual(initialState.setIn(['neurons', 'testId', 'visible'], false));
  });
});
