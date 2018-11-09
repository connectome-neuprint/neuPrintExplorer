import React from 'react';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { withStyles } from '@material-ui/core/styles';

import Skeleton from './Skeleton';
import NeuroGlancer from '@janelia-flyem/react-neuroglancer';

const styles = theme => ({
  full: {
    width: '100%',
    height: '100%',
    scroll: 'auto'
  },
});

class NeuronViz extends React.Component {
  state = {
    selectedViewer: 1,
  };

  handleViewerSelect = (event, value) => {
    this.setState({selectedViewer: value});
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.full}>
        <Tabs
          centered
          value={this.state.selectedViewer}
          onChange={this.handleViewerSelect}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Neuroglancer" />
          <Tab label="Skeleton" />
        </Tabs>
        {this.state.selectedViewer === 0 ? <NeuroGlancer perspectiveZoom={80} /> : <Skeleton />}
      </div>
    );
  }
}

export default withStyles(styles)(NeuronViz);
