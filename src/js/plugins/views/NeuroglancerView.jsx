import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';

const Neuroglancer = React.lazy(() => import('@janelia-flyem/react-neuroglancer'));

class NeuroGlancerView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      neurons: Immutable.Map({}),
      coordinates: Immutable.List([]),
      layers: Immutable.Map({})
    };
  }

  componentDidMount() {
    const { query } = this.props;
    if (query.pm.dataset) {
      if (query.pm.bodyIds) {
        const bodyIds = query.pm.bodyIds.toString().split(',');
        this.addLayers(query.pm.dataset);
        this.addNeurons(bodyIds, query.pm.dataset);
      }
    }
  }

  componentDidUpdate() {
    // TODO: get all the neuronIds from the url and add them to the state.
  }

  addNeurons(ids, dataSet) {
    ids.forEach(id => {
      this.addNeuron(id, dataSet);
    });
  }

  addNeuron(id, dataSet) {
    const coordinatesQuery = `MATCH (n :Segment {bodyId: ${id}})-[:Contains]->(:SynapseSet)-[:Contains]->(ss) RETURN ss.location.x, ss.location.y, ss.location.z limit 1`;
    return fetch('/api/custom/custom?np_explorer=neuroglancer_neuron_coordinates', {
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        cypher: coordinatesQuery,
        dataset: dataSet
      }),
      method: 'POST',
      credentials: 'include'
    })
      .then(result => result.json())
      .then(result => {
        const { neurons } = this.state;
        const updated = neurons.set(
          id,
          Immutable.Map({
            id,
            dataSet,
            color: '#ffffff',
            visible: true
          })
        );

        this.setState({
          neurons: updated,
          coordinates: Immutable.List(result.data[0])
        });
      })
      .catch(error => this.setState({ loadingError: error }));
  }

  addLayers(dataSet) {
    fetch(`/api/npexplorer/nglayers/${dataSet}.json`, {
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json'
      },
      method: 'GET',
      credentials: 'include'
    })
    .then(response => response.json())
    .then(json => {
        this.setState({ layers: json });
    });
  }

  render() {
    const { layers, neurons, coordinates, loadingError } = this.state;

    if (loadingError) {
      return <div>{loadingError.message}</div>;
    }

    const basicViewerState = {
      perspectiveOrientation: [0.1, -0.3, -0.3, 0.8],
      perspectiveZoom: 95,
      navigation: {
        pose: {
          position: {
            voxelCoordinates: []
          }
        },
        zoomFactor: 8
      },
      layout: 'xy-3d',
      layers: []
    };

    const viewerState = {...basicViewerState, ...layers};

    // loop over the neurons and add them to the layers
    neurons.forEach(neuron => {
      viewerState.layers.forEach(layer => {
        if (layer.name === neuron.get('dataSet')) {
          if (layer.segments) {
            layer.segments.push(neuron.get('id'));
          }
          else {
            /* eslint-disable-next-line no-param-reassign */
            layer.segments = [neuron.get('id')];
          }
        }
      });
    });

    viewerState.navigation.pose.position.voxelCoordinates = coordinates.toJS();
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <Neuroglancer perspectiveZoom={80} viewerState={viewerState} brainMapsClientId="NOT_A_VALID_ID" ngServer="https://clio-ng.janelia.org" />
      </Suspense>
    );
  }


}

NeuroGlancerView.propTypes = {
  query: PropTypes.object.isRequired
};

export default NeuroGlancerView;
