import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import { withStyles } from '@material-ui/core/styles';

import { setFullScreen, clearFullScreen } from 'actions/app';
import Skeleton from './Skeleton';
import NeuroGlancer from '@janelia-flyem/react-neuroglancer';

const styles = theme => ({
  full: {
    position: 'relative',
    width: '100%',
    height: '100%',
    scroll: 'auto'
  },
  button: {
    zIndex: 2,
    position: 'absolute',
    top: '0',
    right: '0'
  }
});

class NeuronViz extends React.Component {
  state = {
    selectedViewer: 1
  };

  handleViewerSelect = (event, value) => {
    this.setState({ selectedViewer: value });
  };

  render() {
    const { classes, fullscreen, actions } = this.props;

    const viewerState = {
      perspectiveZoom: 20,
      navigation: {
        zoomFactor: 8
      },
      layers: {}
    };

    // fetch layers from neuprint, based on the query results or the query itself? 
    // MATCH (n:Meta:mb6) RETURN n.dvidServer, n.uuid 
    // set the list of neuron ids in the viewerState
    

    return (
      <div className={classes.full}>
        {fullscreen ? (
          <Button
            className={classes.button}
            variant="fab"
            color="primary"
            onClick={actions.clearFullScreen}
          >
            <Icon>fullscreen_exit</Icon>
          </Button>
        ) : (
          <Button
            className={classes.button}
            variant="fab"
            color="primary"
            onClick={actions.setFullScreen}
          >
            <Icon>fullscreen</Icon>
          </Button>
        )}

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
        {this.state.selectedViewer === 0 ? (
          <NeuroGlancer perspectiveZoom={80} viewerState={viewerState} />
        ) : (
          <Skeleton />
        )}
      </div>
    );
  }
}

NeuronViz.propTypes = {
  fullscreen: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired
};

const NeuronVizState = state => {
  return {
    fullscreen: state.app.get('fullscreen')
  };
};

const NeuronVizDispatch = dispatch => ({
  actions: {
    clearFullScreen: () => {
      dispatch(clearFullScreen());
    },
    setFullScreen: () => {
      dispatch(setFullScreen());
    }
  }
});

export default withStyles(styles)(
  connect(
    NeuronVizState,
    NeuronVizDispatch
  )(NeuronViz)
);
