import React, { useContext, useCallback, useMemo, useState, useEffect, Suspense } from 'react';
import PropTypes from 'prop-types';
import { NgViewerContext } from '../../contexts/NgViewerContext';

const Neuroglancer = React.lazy(() => import('@janelia-flyem/react-neuroglancer'));
// const Neuroglancer = React.lazy(() => import('./Neuroglancer'));

function debounce(func, wait, immediate) {
  let timeout;
  function debounced(...args) {
    const context = this;
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  }

  Object.assign(debounced, {
    cancel() {
      clearTimeout(timeout);
    },
  });

  return debounced;
}

const defaultViewerState = {
  navigation: {
    pose: {
      position: {
        voxelCoordinates: [],
      },
    },
    zoomFactor: 8,
  },
  layout: 'xy-3d',
  layers: [],
};

export default function NeuroGlancerView({ query }) {
  const bodyIds = useMemo(() => query.pm.bodyIds.toString().split(','), [query.pm.bodyIds]);
  const [layersLoading, setLayersLoading] = useState(true);
  const [loadingError, setLoadingError] = useState();
  const { ngViewerState, setNgViewerState } = useContext(NgViewerContext);

  const { dataset } = query.pm;

  // load the layers for the dataset
  useEffect(() => {
    fetch(`/api/npexplorer/nglayers/${dataset}.json`, {
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
      },
      method: 'GET',
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((json) => {
        setNgViewerState((prevState) => {
          // grab the previous state for the current dataset and merge with the json
          const prevDatasetState = prevState[dataset] || defaultViewerState;
          const newDatasetState = { ...prevDatasetState, ...json };
          const newState = { ...prevState, [dataset]: newDatasetState };
          return newState;
        });
        setLayersLoading(false);
      })
      .catch((error) => {
        setLoadingError(error);
      });
  }, [dataset, setNgViewerState]);

  // add the bodyIds to the layer segments
  useEffect(() => {
    const datasetState = ngViewerState[dataset] || defaultViewerState;
    if (datasetState.layers.length > 0) {
      setNgViewerState((prevState) => {
        const newDatasetState = { ...prevState[dataset] };
        // merge the bodyIds into the layer segments array, if the layer name matches the dataset
        // there should be no duplicate ids
        newDatasetState.layers.forEach((layer) => {
          if (layer.name === dataset) {
            if (layer.segments) {
              // eslint-disable-next-line no-param-reassign
              layer.segments = [...new Set([...layer.segments, ...bodyIds])];
            } else {
              // eslint-disable-next-line no-param-reassign
              layer.segments = bodyIds;
            }
          }
        });
        if (JSON.stringify(newDatasetState) === JSON.stringify(prevState[dataset])) {
          return prevState;
        }
        const newState = { ...prevState, [dataset]: newDatasetState };
        return newState;
      });
    }
  }, [bodyIds, dataset, ngViewerState, setNgViewerState]);

  const viewerState = useMemo(() => ({ ...ngViewerState[dataset] }), [ngViewerState, dataset]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onViewerStateChanged = useCallback(
    debounce(
      (state) => {
        // eslint-disable-line react-hooks/exhaustive-deps
        setNgViewerState((prevState) => {
          // if the serialized state is the same as the serialized current
          // state, don't do anything
          const prevDatasetState = prevState[dataset] || defaultViewerState;
          if (JSON.stringify(state) === JSON.stringify(prevDatasetState)) {
            return prevState;
          }
          const newState = { ...prevState, [dataset]: state };
          return newState;
        });
      },
      1000,
      false
    ),
    []
  );

  if (loadingError) {
    return <div>{loadingError.message}</div>;
  }

  if (layersLoading) {
    return <div>Loading layers...</div>;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Neuroglancer
        perspectiveZoom={80}
        viewerState={viewerState}
        brainMapsClientId="NOT_A_VALID_ID"
        ngServer="https://clio-ng.janelia.org"
        onViewerStateChanged={onViewerStateChanged}
      />
    </Suspense>
  );
}
NeuroGlancerView.propTypes = {
  query: PropTypes.object.isRequired,
};
