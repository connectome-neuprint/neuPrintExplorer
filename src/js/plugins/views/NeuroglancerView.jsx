import React, { useContext, useCallback, useMemo, useState, useEffect, Suspense } from 'react';
import PropTypes from 'prop-types';
import { setQueryString, getQueryObject } from 'helpers/queryString';
import { NgViewerContext } from 'contexts/NgViewerContext';

const Neuroglancer = React.lazy(() => import('@janelia-flyem/react-neuroglancer'));

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

function cleanedIds(ids) {
  // strip out duplicates
  const filtered = ids.filter((value, index, self) => self.indexOf(value) === index);
  // strip out empty strings
  const nonEmpty = filtered.filter((value) => value !== '');
  // sort the bodyIds lexicographically to match the neuroglancer state
  nonEmpty.sort((a, b) => a.localeCompare(b));
  return nonEmpty;
}

export default function NeuroGlancerView({ query }) {
  const [layersLoading, setLayersLoading] = useState(true);
  const [loadingError, setLoadingError] = useState();

  const incommingState = query?.result?.data
  const defaultPosition = incommingState?.position;

  // we have to set the initial state of the bodyIds, so that the useEffect
  // calls don't trigger with an empty array and wipe out the bodyIds in the
  // query string.
  const queryBodyIds = useMemo(() => {
    let bodyIds = [];
    if (query.pm.bodyIds) {
      bodyIds = query.pm.bodyIds.toString().split(',');
    }
    return cleanedIds(bodyIds);
  }, [query.pm.bodyIds]);
  const [bodyIds, setBodyIds] = useState(queryBodyIds);
  const { ngViewerState, setNgViewerState } = useContext(NgViewerContext);

  const { dataset } = query.pm;

  // load the layers for the dataset
  useEffect(() => {
    // if the dataset is already in the ngViewerState then don't load it again 
    if (ngViewerState[dataset]) {
      setLayersLoading(false);
      return;
    }
    try {
      setNgViewerState((prevState) => {
        // grab the previous state for the current dataset and merge with the json
        const prevDatasetState = prevState[dataset] || defaultViewerState;
        const newDatasetState = { ...prevDatasetState, ...incommingState };
        const newState = { ...prevState, [dataset]: newDatasetState };
        return newState;
      });
      setLayersLoading(false);
    } catch (error) {
      setLoadingError(error);
    };
    // We really only want to run this once when a new dataset
    // is loaded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // add the bodyIds to the layer segments
  useEffect(() => {
    setNgViewerState((prevState) => {
      const newDatasetState = { ...prevState[dataset] };

      // if the layers haven't loaded yet, then don't do anything
      if (!newDatasetState.layers) {
        return prevState;
      }

      const layerOfInterest = newDatasetState.layers.find((layer) => layer.name === dataset);

      if (!layerOfInterest) {
        return prevState;
      }

      // if the bodyIds list hasn't changed, then don't do anything
      if (layerOfInterest && layerOfInterest.segments) {
        if (JSON.stringify(bodyIds) === JSON.stringify(layerOfInterest.segments)) {
          return prevState;
        }
      }

      // merge the new bodyIds into the layer segments array
      if (layerOfInterest) {
        if (layerOfInterest.segments) {
          const updatedSegments = [...new Set([...layerOfInterest.segments, ...bodyIds])];
          updatedSegments.sort((a, b) => a.localeCompare(b));
          layerOfInterest.segments = updatedSegments;
        } else if (bodyIds.length > 0) {
          layerOfInterest.segments = bodyIds;
        }
      }

      const newState = { ...prevState, [dataset]: newDatasetState };
      return newState;
    });
    // We really only want to run this once when a new dataset
    // is loaded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const viewerState = useMemo(() => ({ ...ngViewerState[dataset] }), [ngViewerState, dataset]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onViewerStateChanged = useCallback(
    debounce(
      (state) => {
        const layer = state.layers.find((l) => l.name === dataset);
        let neuroglancerBodyIds = [];
        if (layer && layer.segments) {
          neuroglancerBodyIds = layer.segments;
          setBodyIds((previousIds) => {
            if (JSON.stringify(neuroglancerBodyIds) === JSON.stringify(previousIds)) {
              return previousIds;
            }
            return neuroglancerBodyIds;
          });
        }

        // Alert, nasty hack ahead!!!!
        // For some reason, when neuroglancer first loads, it ignores the position that
        // is passed in the state. So we have to set it to the defaultPosition if it has
        // changed the position value to [0,0,0] or values between 1 and 0.
        if (state.position && state.position[0] <= 1 && state.position[1] <= 1 && state.position[2] <= 1) {
          state.position = defaultPosition;
        }

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
        // update the url to include the new bodyIds from the state.
        const current = getQueryObject('qr', []);
        current.forEach((tab) => {
          if (tab.code === 'ng' && tab.ds === dataset) {
            // eslint-disable-next-line no-param-reassign
            tab.pm.bodyIds = neuroglancerBodyIds;
          }
        });
        // update the query string with the new bodyIds
        setQueryString({ qr: current }, true);
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
NeuroGlancerView.whyDidYouRender = true;
NeuroGlancerView.propTypes = {
  query: PropTypes.object.isRequired,
};
