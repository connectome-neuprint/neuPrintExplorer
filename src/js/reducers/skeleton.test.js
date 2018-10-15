import Immutable from 'immutable';
import reducer from './skeleton';
import C from './constants';

const initialState = Immutable.Map({
  display: false,
  neurons: Immutable.Map({})
});

describe('skeleton reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should handle SKELETON_OPEN when open', () => {
    expect(reducer(initialState.set('display', true), { type: C.SKELETON_OPEN })).toEqual(
      initialState.set('display', true)
    );
  });

  it('should handle SKELETON_OPEN when closed', () => {
    expect(reducer(undefined, { type: C.SKELETON_OPEN })).toEqual(
      initialState.set('display', true)
    );
  });

  it('should handle SKELETON_CLOSE when open', () => {
    expect(reducer(initialState.set('display', true), { type: C.SKELETON_CLOSE })).toEqual(
      initialState.set('display', false)
    );
  });

  it('should handle SKELETON_CLOSE when closed', () => {
    expect(reducer(undefined, { type: C.SKELETON_CLOSE })).toEqual(
      initialState.set('display', false)
    );
  });

  const skeletonAdded = initialState.setIn(
    ['neurons', 34567],
    Immutable.Map({
      name: 34567,
      visible: true
    })
  );

  it('should handle adding a skeleton', () => {
    expect(reducer(undefined, { type: C.SKELETON_ADD, id: 34567 })).toEqual(
      initialState.setIn(
        ['neurons', 34567],
        Immutable.Map({
          name: 34567,
          visible: true
        })
      )
    );
  });

  it('should handle removing a skeleton', () => {
    expect(reducer(skeletonAdded, { type: C.SKELETON_REMOVE, id: 34567 })).toEqual(initialState);
  });

  const neuronVisible = initialState.setIn(
    ['neurons', 34567],
    Immutable.Map({
      name: 34567,
      visible: true
    })
  );

  const neuronHidden = neuronVisible.setIn(['neurons', 34567, 'visible'], false);

  it('should handle showing a neuron', () => {
    expect(reducer(neuronHidden, { type: C.SKELETON_NEURON_SHOW, id: 34567 })).toEqual(
      neuronVisible
    );
  });

  it('should handle hiding a neuron', () => {
    expect(reducer(neuronVisible, { type: C.SKELETON_NEURON_HIDE, id: 34567 })).toEqual(
      neuronHidden
    );
  });




});
