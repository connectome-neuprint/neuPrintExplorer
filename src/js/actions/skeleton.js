import randomColor from 'randomcolor';
import PouchDB from 'pouchdb';
import C from '../reducers/constants';

export function skeletonOpen() {
  return {
    type: C.SKELETON_OPEN
  };
}

export function skeletonClose() {
  return {
    type: C.SKELETON_CLOSE
  };
}

export function toggleSkeleton() {
  return (dispatch, getState) => {
    if (getState().skeleton.get('display')) {
      dispatch(skeletonClose());
    } else {
      dispatch(skeletonOpen());
    }
  };
}

function skeletonLoading(id) {
  return {
    type: C.SKELETON_NEURON_LOADING,
    id
  };
}

function skeletonLoadError(error) {
  return {
    type: C.SKELETON_NEURON_LOAD_ERROR,
    error
  };
}

function skeletonLoaded(id, dataSet, result) {
  // parse the result into swc format for skeleton viewer code.
  const data = {};
  const color = randomColor({ luminosity: 'light', hue: 'random' });

  result.data.forEach(row => {
    data[parseInt(row[0], 10)] = {
      x: parseInt(row[1], 10),
      y: parseInt(row[2], 10),
      z: parseInt(row[3], 10),
      radius: parseInt(row[4], 10),
      parent: parseInt(row[5], 10)
    };
  });

  return {
    type: C.SKELETON_ADD,
    id,
    dataSet,
    swc: data,
    color
  };
}

const skeletonQuery =
  'MATCH (:`YY-Neuron` {bodyId:ZZ})-[:Contains]->(:Skeleton)-[:Contains]->(root :SkelNode) WHERE NOT (root)<-[:LinksTo]-() RETURN root.rowNumber AS rowId, root.location.x AS x, root.location.y AS y, root.location.z AS z, root.radius AS radius, -1 AS link ORDER BY root.rowNumber UNION match (:`YY-Neuron` {bodyId:ZZ})-[:Contains]->(:Skeleton)-[:Contains]->(s :SkelNode)<-[:LinksTo]-(ss :SkelNode) RETURN s.rowNumber AS rowId, s.location.x AS x, s.location.y AS y, s.location.z AS z, s.radius AS radius, ss.rowNumber AS link ORDER BY s.rowNumber';

export function skeletonAdd(id, dataSet) {
  return function skeletonAddAsync(dispatch) {
    // dispatch loading skeleton action
    dispatch(skeletonLoading(id));
    // generate the querystring.
    const completeQuery = skeletonQuery.replace(/YY/g, dataSet).replace(/ZZ/g, id);
    // fetch swc data
    return fetch('/api/custom/custom', {
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        cypher: completeQuery
      }),
      method: 'POST',
      credentials: 'include'
    })
      .then(result => result.json())
      .then(result => {
        if ('error' in result) {
          throw result.error;
        }
        dispatch(skeletonLoaded(id, dataSet, result));
      })
      .catch(error => dispatch(skeletonLoadError(error)));
    // dispatch skeleton storing action
    // dispatch skeleton error if issues occur.
  };
}

export function skeletonAddandOpen(id, dataSet) {
  return function skeletonAddandOpenAsync(dispatch) {
    dispatch(skeletonAdd(id, dataSet));
    dispatch(skeletonOpen());
  };
}
export function skeletonRemove(id) {
  return {
    type: C.SKELETON_REMOVE,
    id
  };
}
export function skeletonNeuronShow(id) {
  return {
    type: C.SKELETON_NEURON_SHOW,
    id
  };
}
export function skeletonNeuronHide(id) {
  return {
    type: C.SKELETON_NEURON_HIDE,
    id
  };
}
export function skeletonNeuronToggle(id) {
  return function skeletonNeuronToggleAsync(dispatch, getState) {
    if (getState().skeleton.getIn(['neurons', id, 'visible'])) {
      dispatch(skeletonNeuronHide(id));
    } else {
      dispatch(skeletonNeuronShow(id));
    }
  };
}

export function setView(position) {
  return {
    type: C.SKELETON_SET_CAMERA_POSITION,
    position
  };
}

function skeletonLoadingCompartment(id) {
  return {
    type: C.SKELETON_COMPARTMENT_LOADING,
    id
  };
}

function skeletonLoadedCompartment(id, result) {
  return function skeletonLoadedCompartmentAsync(dispatch) {
    const db = new PouchDB('neuprint_compartments');
    return db
      .putAttachment(id, 'obj', btoa(result), 'text/plain')
      .then(() =>
        dispatch({
          type: C.SKELETON_ADD_COMPARTMENT,
          name: id,
          obj: 'localStorage',
          visible: true,
          color: '#000000'
        })
      )
      .catch(err => {
        if (err.name === 'conflict') {
          dispatch({
            type: C.SKELETON_ADD_COMPARTMENT,
            name: id,
            obj: 'localStorage',
            visible: true,
            color: '#000000'
          });
        } else {
          dispatch({
            type: C.SKELETON_COMPARTMENT_LOAD_ERROR,
            error: err
          });
        }
      });
  };
}

function fetchMesh(id, key, dispatch, host, uuid) {
  return fetch(
    `${host}/api/node/${uuid}/roi_data/key/${key}`,
    {
      headers: {
        'Content-Type': 'text/plain',
        Accept: 'text/plain'
      },
      method: 'GET'
    }
  )
    .then(result => result.text())
    .then(result => {
      dispatch(skeletonLoadedCompartment(id, result));
    });
}

export function skeletonAddCompartment(id) {
  return function skeletonAddCompartmentAsync(dispatch, getState) {
    dispatch(skeletonLoadingCompartment(id));
    const meshHost = getState().neo4jsettings.get('meshInfo').hemibrain;
    const { uuid } = getState().neo4jsettings.get('datasetInfo').hemibrain;


    return fetch(
      `${meshHost}/api/node/${uuid}/rois/key/${id}`,
      {
        headers: {
          'Content-Type': 'text/plain',
          Accept: 'application/json'
        },
        method: 'GET'
      }
    )
      .then(result => result.json())
      .then(result => {
        const { key } = result['->'];
        fetchMesh(id, key, dispatch, meshHost, uuid);
      })
      .catch(error => dispatch(skeletonLoadError(error)));
  };
}
export function skeletonRemoveCompartment(id) {
  return {
    type: C.SKELETON_REMOVE_COMPARTMENT,
    id
  };
}
