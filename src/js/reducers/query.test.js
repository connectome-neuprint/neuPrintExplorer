import Immutable from 'immutable';
import C from './constants';
import query from './query';

const state = Immutable.Map({
  isQuerying: false,
  tabs: Immutable.List()
});

// note: can't test equality of functions
describe('query Reducer', () => {
  it('PLUGIN_SUBMITTING success', () => {
    const action = {
      type: C.PLUGIN_SUBMITTING
    };
    expect(query(undefined, action)).toEqual(state.set('isQuerying', true));
  });

  it('PLUGIN_SUBMIT_ERROR success', () => {
    const action = {
      type: C.PLUGIN_SUBMIT_ERROR
    };
    expect(query(undefined, action)).toEqual(state);
    expect(query(state, action)).toEqual(state);
    expect(query(state.set('isQuerying', true), action)).toEqual(state);
  });

  it('PLUGIN_SAVE_RESPONSE success', () => {
    const action = {
      type: C.PLUGIN_SAVE_RESPONSE
    };
    expect(query(undefined, action)).toEqual(state);
    expect(query(state.set('isQuerying', true), action)).toEqual(state);
  });
});
