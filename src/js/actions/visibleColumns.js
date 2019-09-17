import C from '../reducers/constants';

export function setColumnStatus(tabIndex=0, columnIndex=0, status=true) {
  return {
    type: C.COLUMN_UPDATE_STATUS,
    tabIndex,
    columnIndex,
    status
  };
}

export function initColumnStatus(tabIndex=0, columns) {
  return {
    type: C.COLUMN_INIT_STATUS,
    tabIndex,
    columns
  };
}

export function hideColumn(tabIndex=0, columnIndex=0) {
  return {
    type: C.COLUMN_UPDATE_STATUS,
    tabIndex,
    columnIndex,
    status: false
  };
}

export function showColumn(tabIndex=0, columnIndex=0) {
  return {
    type: C.COLUMN_UPDATE_STATUS,
    tabIndex,
    columnIndex,
    status: true
  };
}
