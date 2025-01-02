import React, { useContext, useCallback, useMemo, useState, useEffect, Suspense } from 'react';
import PropTypes from 'prop-types';
import { NgViewerContext } from '../../contexts/NgViewerContext';

const Neuroglancer = React.lazy(() => import('@janelia-flyem/react-neuroglancer'));
// const Neuroglancer = React.lazy(() => import('./Neuroglancer'));

function debounce (func, wait, immediate) {
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
};

export default function NeuroGlancerView({ query }) {
  const bodyIds = useMemo(() => query.pm.bodyIds.toString().split(','), [query.pm.bodyIds]);
  const [layersLoading, setLayersLoading] = useState(true);
  const [loadingError, setLoadingError] = useState();
  const { ngViewerState, setNgViewerState } = useContext(NgViewerContext);

  useEffect(() => {
    fetch(`/api/npexplorer/nglayers/${query.pm.dataset}.json`, {
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
      },
      method: 'GET',
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((json) => {
        //  setLayers(json);
        setNgViewerState((prevState) => {
          const newState = { ...prevState, ...json };
          return newState;
        });
        setLayersLoading(false);
      }).catch((error) => {
        setLoadingError(error);
      });
  }, [query.pm.dataset, setNgViewerState]);

  useEffect(() => {
    if (ngViewerState.layers.length > 0) {
      setNgViewerState((prevState) => {
        const newState = { ...prevState };
        // merge the bodyIds into the layer segments array, if the layer name matches the dataset
        // there should be no duplicate ids
        newState.layers.forEach((layer) => {
          if (layer.name === query.pm.dataset) {
            if (layer.segments) {
              layer.segments = [...new Set([...layer.segments, ...bodyIds])]; // eslint-disable-line no-param-reassign
            } else {
              layer.segments = bodyIds; // eslint-disable-line no-param-reassign
            }
          }
        });
        return newState;
      });
    }
  }, [bodyIds, query.pm.dataset, ngViewerState.layers, setNgViewerState]);

  const viewerState = useMemo(() => ({ ...ngViewerState }), [ngViewerState]);

  const onViewerStateChanged = useCallback(debounce((state) => { // eslint-disable-line react-hooks/exhaustive-deps
    setNgViewerState((prevState) => {
      // if the serialized state is the same as the serialized current
      // state, don't do anything
      if (JSON.stringify(state) === JSON.stringify(prevState)) {
        return prevState;
      }
      return state;
    });
  }, 1000, false), []);

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
