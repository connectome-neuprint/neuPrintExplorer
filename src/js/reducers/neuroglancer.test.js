import Immutable from 'immutable';
import C from './constants';
import reducer from './neuroglancer';

const initialState = Immutable.Map({
  display: false,
  neurons: Immutable.Map({}),
  layers: Immutable.Map({}),
  coordinates: Immutable.List([]),
  loading: false,
  error: null
});

describe('neuroglancer Reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should handle adding an id', () => {
    expect(reducer(undefined, { type: C.NEUROGLANCER_ADD_ID, id: 34567 })).toEqual(initialState);
  });
});
