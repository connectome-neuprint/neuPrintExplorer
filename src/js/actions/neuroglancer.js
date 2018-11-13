import C from '../reducers/constants';

export function neuroglancerOpen() {
  return {
    type: C.NEUROGLANCER_OPEN
  };
}

export function neuroglancerClose() {
  return {
    type: C.NEUROGLANCER_CLOSE
  };
}

export function toggleNeuroglancer() {
  return (dispatch, getState) => {
    if (getState().neuroglancer.get('display')) {
      dispatch(neuroglancerClose());
    } else {
      dispatch(neuroglancerOpen());
    }
  };
}

function neuroglancerLoading(id) {
  return {
    type: C.NEUROGLANCER_LAYER_LOADING,
    id
  };
}

function neuroglancerLoadError(error) {
  return {
    type: C.NEUROGLANCER_LAYER_LOAD_ERROR,
    error
  };
}

function neuroglancerLoaded(dataSet, result) {
  return function neuroglancerLoadedAsync(dispatch) {
    // grayscale
    dispatch({
      type: C.NEUROGLANCER_LAYER_ADD,
      host: result.data[0][3],
      uuid: result.data[0][4],
      dataInstance: result.data[0][5],
      dataType: 'image',
      dataSet: `${dataSet}-grayscale`,
    });

    // segmentation
    dispatch({
      type: C.NEUROGLANCER_LAYER_ADD,
      host: result.data[0][0],
      uuid: result.data[0][1],
      dataInstance: result.data[0][2],
      dataType: 'segmentation',
      dataSet,
    });
  }
}

export function neuroglancerAddNeuron(id, dataSet) {
  return {
    type: C.NEUROGLANCER_NEURON_ADD,
    id,
    dataSet,
    color: '#ffffff',
  };
}


export function neuroglancerAddLayer(id, dataSet) {
  return function neuroglancerAddLayerAsync(dispatch) {
    // dispatch loading neuroglancer action
    dispatch(neuroglancerLoading(id));
    // generate the querystring.
    const neuroglancerQuery = `MATCH (n:Meta:${dataSet}) WITH apoc.convert.fromJsonMap(n.neuroglancerInfo) as nInfo, n.uuid AS uuid RETURN nInfo.segmentation.host AS segmentationHost, uuid AS segmentationUuid, nInfo.segmentation.dataType AS segmentationDataType, nInfo.grayscale.host AS grayscaleHost, nInfo.grayscale.uuid AS grayscaleUuid, nInfo.grayscale.dataType AS grayscaleDataType`;
    // fetch swc data
    fetch('/api/custom/custom', {
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        cypher: neuroglancerQuery
      }),
      method: 'POST',
      credentials: 'include'
    })
      .then(result => result.json())
      .then(result => {
        if ('error' in result) {
          throw result.error;
        }
        dispatch(neuroglancerLoaded(dataSet, result));
      })
      .catch(error => dispatch(neuroglancerLoadError(error)));
    // dispatch neuroglancer storing action
    // dispatch neuroglancer error if issues occur.
  };
}

export function neuroglancerAddandOpen(id, dataSet) {
  return function neuroglancerAddandOpenAsync(dispatch) {
    dispatch(neuroglancerAddLayer(id, dataSet));
    dispatch(neuroglancerAddNeuron(id, dataSet));
    dispatch(neuroglancerOpen());
  };
}
export function neuroglancerRemove(id) {
  return {
    type: C.NEUROGLANCER_REMOVE,
    id
  };
}
export function neuroglancerNeuronShow(id) {
  return {
    type: C.NEUROGLANCER_NEURON_SHOW,
    id
  };
}
export function neuroglancerNeuronHide(id) {
  return {
    type: C.NEUROGLANCER_NEURON_HIDE,
    id
  };
}
export function neuroglancerNeuronToggle(id) {
  return function(dispatch, getState) {
    if (getState().neuroglancer.getIn(['neurons', id, 'visible'])) {
      dispatch(neuroglancerNeuronHide(id));
    } else {
      dispatch(neuroglancerNeuronShow(id));
    }
  };
}
