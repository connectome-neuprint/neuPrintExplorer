import React from 'react';
import Neuroglancer from 'neuroglancer-react';
import Grid from 'material-ui/Grid';

class NeuroGlancer extends React.Component {
  render() {
    return (
      <Grid container>
        <Grid item xs={12}>
          <Neuroglancer />
        </Grid>
      </Grid>
    );
  }
}

export default NeuroGlancer;
