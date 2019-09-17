/*
 * Store for column visibility toggles.
 */

import Immutable from 'immutable';
import C from './constants';

const columnVisState = Immutable.Map({
  tab: Immutable.List([])
});

export default function columnVisReducer(state = columnVisState, action) {
  switch (action.type) {
    case C.PLUGIN_SUBMITTING: {
      return state.setIn(['tab', action.tab], Immutable.List([]));
    }
    case C.COLUMN_INIT_STATUS: {
      return state.setIn(['tab', action.tabIndex], Immutable.List(action.columns));
    }
    case C.CLEAR_NEW_RESULT: {
      return state.removeIn(['tab', action.index]);
    }
    case C.COLUMN_UPDATE_STATUS: {
      return state.setIn(['tab', action.tabIndex, action.columnIndex, 'status'], action.status);
    }
    default: {
      return state;
    }
  }
}
