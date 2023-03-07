/*
 * Stores configuration and other basic information for vimo server.
*/
import Immutable from 'immutable';
import C from './constants';

const vimoServerState = Immutable.Map({
  url: undefined,
});

export default function vimoReducer(state = vimoServerState, action) {
  switch (action.type) {
    case C.SET_VIMO_URL: {
      return state.set('url', action.url);
    }
    default: {
      return state;
    }
  }
}
