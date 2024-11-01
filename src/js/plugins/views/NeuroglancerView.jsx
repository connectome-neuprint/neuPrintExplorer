import React, { useMemo, useState, useEffect, Suspense } from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';

const Neuroglancer = React.lazy(() => import('@janelia-flyem/react-neuroglancer'));

export default function NeuroGlancerView({ query }) {
  const bodyIds = useMemo(() => query.pm.bodyIds.toString().split(','), [query.pm.bodyIds]);
  const [layers, setLayers] = useState();
  const [coordinates, setCoordinates] = useState();
  const [loadingError, setLoadingError] = useState();

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
        setLayers(json);
      });
  }, [query.pm.dataset]);

  useEffect(() => {
    const lastId = bodyIds[bodyIds.length - 1];
    const coordinatesQuery = `MATCH (n :Segment {bodyId: ${lastId}})-[:Contains]->(:SynapseSet)-[:Contains]->(ss) RETURN ss.location.x, ss.location.y, ss.location.z limit 1`;
    fetch('/api/custom/custom?np_explorer=neuroglancer_neuron_coordinates', {
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        cypher: coordinatesQuery,
        dataset: query.pm.dataset
      }),
      method: 'POST',
      credentials: 'include',
    })
      .then((result) => result.json())
      .then((result) => {
        setCoordinates(Immutable.List(result.data[0]));
      })
      .catch((error) => {
        setLoadingError(error);
      });
  }, [bodyIds, query.pm.dataset]);

  if (loadingError) {
    return <div>{loadingError.message}</div>;
  }

  const basicViewerState = {
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

  const viewerState = { ...basicViewerState, ...layers };

  bodyIds.forEach((id) => {
    viewerState.layers.forEach((layer) => {
      if (layer.name === query.pm.dataset) {
        if (layer.segments) {
          layer.segments.push(id);
        } else {
          layer.segments = [id];
        }
      }
    });
  });

  if (coordinates) {
    viewerState.navigation.pose.position.voxelCoordinates = coordinates.toJS();
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Neuroglancer
        perspectiveZoom={80}
        viewerState={viewerState}
        brainMapsClientId="NOT_A_VALID_ID"
        ngServer="https://clio-ng.janelia.org"
      />
    </Suspense>
  );
}
NeuroGlancerView.propTypes = {
  query: PropTypes.object.isRequired,
};
