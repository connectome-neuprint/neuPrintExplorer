import C from '../reducers/constants';


export function setQueryError(error) {
  return {
    type: C.SET_NEO_ERROR,
    neoError: error,
  };
}

export function appendData(results) {
  return {
    type: C.APPEND_RESULTS,
    allTables: results,
  };
}

export function saveData(results) {
  return {
    type: C.UPDATE_RESULTS,
    allTables: results,
  };
}

export function finishQuery() {
  return {
    type: C.FINISH_QUERY,
  };
}
