import PouchDB from 'pouchdb';
import C from '../reducers/constants';

// eslint-disable-next-line import/prefer-default-export
export function addAndOpen3DViewer(id, dataSet, tabIndex, color) {
  return async (dispatch) => {
    if (color) {
      // set the color here if provided
      const db = new PouchDB('neuprint_compartments');
      const doc = await db.get(`sk_${id}`)
      const updated = doc;
      // only add a record to pouch db if there is a defined color
      try {
        updated.color = color;
        await db.put(updated);
      } catch(e) {
        // only add a record to pouch db if there is a defined color
        const record = {
          _id: `sk_${id}`,
          color,
        };
        await db.put(record);
      }
    }

    dispatch({
      type: C.ADD_AND_OPEN_3D_VIEWER,
      id,
      dataSet,
      tabIndex,
      color,
    });
  };
}

export function removeBodyFrom3DViewer(id, dataSet) {
  return async (dispatch) => {
    dispatch({
      type: C.REMOVE_BODY_FROM_3D_VIEWER,
      id,
      dataSet,
    });
  };
}
