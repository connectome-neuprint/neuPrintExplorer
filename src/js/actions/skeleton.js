import C from '../reducers/constants';
import randomColor from 'randomcolor';

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
    if (getState().skeleton.display) {
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
    data[parseInt(row[0])] = {
      x: parseInt(row[1]),
      y: parseInt(row[2]),
      z: parseInt(row[3]),
      radius: parseInt(row[4]),
      parent: parseInt(row[5]),
    }
  });

  return {
    type: C.SKELETON_ADD,
    id,
    dataSet,
    swc: data,
    color,
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
    fetch('/api/custom/custom', {
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
  return function(dispatch, getState) {
    if (getState().skeleton.getIn(['neurons', id, 'visible'])) {
      dispatch(skeletonNeuronHide(id));
    } else {
      dispatch(skeletonNeuronShow(id));
    }
  };
}
