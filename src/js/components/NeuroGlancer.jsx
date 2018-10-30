import React from 'react';
import Neuroglancer from '@janelia-flyem/react-neuroglancer';
import Grid from '@material-ui/core/Grid';

class NeuroGlancer extends React.Component {
  render() {
    const viewerState = {};
    return (
      <Grid container>
        <Grid item xs={12}>
          <Neuroglancer perspectiveZoom={80} viewerState={viewerState} />
        </Grid>
      </Grid>
    );
  }
}

export default NeuroGlancer;
