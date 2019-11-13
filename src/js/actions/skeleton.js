import PouchDB from 'pouchdb';
import randomColor from 'randomcolor';
import C from '../reducers/constants';

const db = new PouchDB('neuprint_compartments');

export function skeletonAddandOpen(id, dataSet, tabIndex) {
  return {
    type: C.SKELETON_ADD_ID,
    id,
    dataSet,
    tabIndex
  };
}

export function skeletonRemove(id, dataSet, tabIndex) {
  return {
    type: C.SKELETON_REMOVE,
    id,
    dataSet,
    tabIndex
  };
}

export const DefaultSynapseRadius = 40;
export const MinSynapseRadius = 10;
export const MaxSynapseRadius = 200;

function loadedSynapse(bodyId, synapseId, dataSet, response, options = { isInput: true }) {
  return function loadedSynapseAsync(dispatch) {
    const data = {};

    dispatch({
      type: 'SKELETON_SYNAPSE_PROCESSING'
    });

    // reformat response into SWC.
    response.data.forEach((row, i) => {
      data[i + 1] = {
        x: parseInt(row[0], 10),
        y: parseInt(row[1], 10),
        z: parseInt(row[2], 10),
        radius: options.radius ? options.radius : DefaultSynapseRadius,
        parent: -1
      };
    });

    const dispatchedObject = {
      type: C.SKELETON_SYNAPSE_LOADED,
      synapseId,
      synapseType: options.isInput ? 'inputs' : 'outputs',
      bodyId,
      data,
      color: '#ff0000' // default color is bright red.
    };

    const colorStringId = options.isInput ? `input_${synapseId}` : `output_${synapseId}`;
    // check to see if we have a color cached for this.
    // if yes, then return the color,
    // else, generate random color and cache it.
    db.get(colorStringId)
      .then(doc => {
        const { color } = doc;
        dispatchedObject.color = color;
        dispatch(dispatchedObject);
      })
      .catch(() => {
        const color = randomColor({ luminosity: 'light', hue: 'random' });
        db.put({
          _id: colorStringId,
          color
        }).then(() => {
          dispatchedObject.color = color;
          dispatch(dispatchedObject);
        });
      });
    }
  }

function loadingSynapse(bodyId, synapseId) {
  return {
    type: C.SKELETON_SYNAPSE_LOADING,
    bodyId,
    synapseId
  };
}

function loadSynapseError(bodyId, synapseId, error) {
  return {
    type: C.SKELETON_SYNAPSE_LOAD_ERROR,
    bodyId,
    synapseId,
    error
  };
}

// output
const tbarQuery =
  'MATCH (n :Neuron {bodyId: <TARGETBODYID>})-[:Contains]->(ss :SynapseSet)-[:ConnectsTo]->(:SynapseSet)<-[:Contains]-(m :Neuron {bodyId: <OTHERBODYID>}) WITH ss MATCH (ss)-[:Contains]->(s :Synapse) RETURN s.location.x AS x, s.location.y AS y, s.location.z AS z';

// input
const psdQuery =
  'MATCH (n :Neuron {bodyId: <TARGETBODYID>})-[:Contains]->(ss :SynapseSet)<-[:ConnectsTo]-(:SynapseSet)<-[:Contains]-(m :Neuron {bodyId: <OTHERBODYID>}) WITH ss MATCH (ss)-[:Contains]->(s :Synapse) RETURN s.location.x AS x, s.location.y AS y, s.location.z AS z';

export function loadSynapse(bodyId, synapseId, dataSet, options = { isInput: true }) {
  return function loadSynapseAsync(dispatch) {
    // set up data fetch
    // fetch data
    //

    if (bodyId === '') {
      return;
    }

    // set the loading status to prevent multiple load calls.
    dispatch(loadingSynapse(bodyId, synapseId));

    let completeQuery = '';
    // generate the querystring.
    if (options.isInput) {
      completeQuery = psdQuery
        .replace(/<OTHERBODYID>/g, synapseId)
        .replace(/<TARGETBODYID>/g, bodyId);
    } else {
      completeQuery = tbarQuery
        .replace(/<OTHERBODYID>/g, synapseId)
        .replace(/<TARGETBODYID>/g, bodyId);
    }

    // fetch swc data
    fetch('/api/custom/custom', {
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        cypher: completeQuery,
	dataset: dataSet
      }),
      method: 'POST',
      credentials: 'include'
    })
      .then(result => result.json())
      .then(result => {
        if ('error' in result) {
          throw result.error;
        }
        dispatch(loadedSynapse(bodyId, synapseId, dataSet, result, options));
      })
      .catch(error => dispatch(loadSynapseError(bodyId, synapseId, error)));
  };
}

export function removeSynapse(bodyId, synapseId, isInput) {
  return {
    type: C.SKELETON_SYNAPSE_REMOVE,
    synapseId,
    bodyId,
    isInput
  };
}

export function toggleSpindle(tabIndex) {
  // TODO: data loading should be done here and not in the state of the Skeleton
  // component. This way we don't get out of sync.
  return {
    type: C.SKELETON_SPINDLE_TOGGLE,
    tabIndex
  };
}

export function toggleSynapsesOnTop(tabIndex) {
  return {
    type: C.SKELETON_SYNAPSES_ON_TOP_TOGGLE,
    tabIndex
  };
}

export function setSynapseRadius(radius, tabIndex) {
  return {
    type: C.SKELETON_SYNAPSE_RADIUS_SET,
    synapseRadius: radius,
    tabIndex
  };
}
