import Immutable from 'immutable';
import C from './constants';
import notification from './notification';

describe('notification Reducer', () => {
  it('NOTIFICATION success', () => {
    const state = Immutable.Map({
      message: null
    });
    const action = {
      type: C.NOTIFICATION,
      notification: {
        message: 'Test message'
      }
    };
    const results = notification(state, action);
    expect(results).toEqual(
      Immutable.Map({
        message: 'Test message'
      })
    );
  });

  it('CLEAR_NOTIFICATION success', () => {
    const state = Immutable.Map({
      message: 'Test message'
    });
    const action = {
      type: C.CLEAR_NOTIFICATION
    };
    const results = notification(state, action);
    expect(results).toEqual(
      Immutable.Map({
        message: null
      })
    );
  });
});
