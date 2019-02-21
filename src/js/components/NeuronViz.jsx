import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import { withStyles } from '@material-ui/core/styles';

import { setFullScreen, clearFullScreen } from 'actions/app';

const NeuroGlancer = React.lazy(() => import('./NeuroGlancer'));
const Skeleton = React.lazy(() => import('./Skeleton'));

const styles = () => ({
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
    const { selectedViewer } = this.state;

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
          value={selectedViewer}
          onChange={this.handleViewerSelect}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Neuroglancer" />
          <Tab label="Skeleton" />
        </Tabs>
        <Suspense fallback={<div>loading...</div>}>
          {selectedViewer === 0 ? (
            <NeuroGlancer />
          ) : (
            <Skeleton />
          )}
        </Suspense>
      </div>
    );
  }
}

NeuronViz.propTypes = {
  fullscreen: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
};

const NeuronVizState = state => ({
    fullscreen: state.app.get('fullscreen')
  });

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
