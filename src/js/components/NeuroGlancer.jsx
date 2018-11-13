import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Neuroglancer from '@janelia-flyem/react-neuroglancer';
import Grid from '@material-ui/core/Grid';

class NeuroGlancer extends React.Component {
  render() {
    const { ngLayers, ngNeurons } = this.props;
    const viewerState = {
      perspectiveZoom: 20,
      navigation: {
        zoomFactor: 8
      },
      layout: 'xy-3d',
      layers: {}
    };

    // loop over ngLayers and add them to the viewerState
    ngLayers.forEach(layer => {
      // add segmentation
      viewerState.layers[layer.get('dataSet')] = {
        source: `dvid://http://${layer.get('host')}/${layer.get('uuid')}/segmentation`,
        type: 'segmentation',
        segments: [],
      }
      // add greyscale
    });
    // loop over the neurons and add them to the layers
    ngNeurons.forEach(neuron => {
      viewerState.layers[neuron.get('dataSet')].segments.push(neuron.get('id'));
    });

    return (
      <Grid container>
        <Grid item xs={12}>
          <Neuroglancer perspectiveZoom={80} viewerState={viewerState} />
        </Grid>
      </Grid>
    );
  }
}

NeuroGlancer.propTypes = {
  actions: PropTypes.object.isRequired,
  ngState: PropTypes.object.isRequired,
  ngLayers: PropTypes.object.isRequired,
  ngNeurons: PropTypes.object.isRequired,
};

const NeuroGlancerState = state => {
  return {
    ngState: state.neuroglancer,
    ngLayers: state.neuroglancer.get('layers'),
    ngNeurons: state.neuroglancer.get('neurons'),
  };
};

const NeuroGlancerDispatch = dispatch => ({
  actions: {}
});

export default connect(
  NeuroGlancerState,
  NeuroGlancerDispatch
)(NeuroGlancer);
