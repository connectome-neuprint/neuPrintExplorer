import Immutable from 'immutable';
import reducer from './skeleton';
import C from './constants';

const initialState = Immutable.Map({
  display: false,
  neurons: Immutable.Map({}),
  compartments: Immutable.Map({}),
  synapses: Immutable.Map({}),
  loading: false,
  error: null,
  cameraPosition: null
});

describe('skeleton reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should handle adding a skeleton', () => {
    expect(reducer(undefined, { type: C.SKELETON_ADD, id: 34567 })).toEqual(initialState);
  });

  it('should handle removing a skeleton', () => {
    expect(reducer(initialState, { type: C.SKELETON_REMOVE, id: 34567 })).toEqual(initialState);
  });
});
