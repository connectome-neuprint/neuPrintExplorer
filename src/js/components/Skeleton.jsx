/*
 * Uses SharkViewer to display a skeleton representation of a neuron
 */

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Chip from '@material-ui/core/Chip';
import { skeletonNeuronToggle, skeletonRemove, setView } from 'actions/skeleton';
import SharkViewer from '@janelia/sharkviewer';
import PouchDB from 'pouchdb';

import CompartmentSelection from './Skeleton/CompartmentSelection';

const styles = theme => ({
  root: {
    position: 'relative',
    width: '100%',
    height: '100%',
    marginTop: theme.spacing.unit * 1,
    backgroundColor: 'white'
  },
  floater: {
    zIndex: 2,
    padding: theme.spacing.unit,
    position: 'absolute'
  },
  footer: {
    zIndex: 2,
    padding: theme.spacing.unit,
    position: 'absolute',
    top: 0,
    right: 0
  },
  skel: {
    width: '100%',
    height: '100%',
    zIndex: 1,
    position: 'relative'
  },
  chip: {
    margin: theme.spacing.unit / 2
  },
  minimize: {
    zIndex: 2,
    position: 'absolute',
    top: '1em',
    right: '1em'
  }
});

class Skeleton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sharkViewer: {
        animate: () => {}
      },
      db: new PouchDB('neuprint_compartments')
    };
    this.skelRef = React.createRef();
  }

  // load skeleton after render takes place
  componentDidMount() {
    const { neurons, compartments } = this.props;
    this.createShark(neurons, compartments);
  }

  componentDidUpdate(prevProps) {
    const { neurons, compartments } = this.props;
    if (
      neurons !== prevProps.neurons ||
      compartments !== prevProps.compartments
    ) {
      this.loadShark(neurons, compartments);
    }
  }

  componentWillUnmount() {
    const { sharkViewer } = this.state;
    const { actions, neurons } = this.props;

    let coords = null;
    let target = null;
    if (neurons.size > 0) {
      coords = sharkViewer.cameraCoords();
      target = sharkViewer.cameraTarget();
    }
    actions.setView({coords, target});
  };


  handleDelete = id => () => {
    const { actions } = this.props;
    actions.skeletonRemove(id);
  };

  handleClick = id => () => {
    const { actions } = this.props;
    actions.skeletonNeuronToggle(id);
  };

  createShark = (swcs, rois) => {
    const { cameraPosition } = this.props;
    const { db } = this.state;
    if (swcs.length !== 0) {
      const moveCamera = !cameraPosition;
      const sharkViewer = new SharkViewer({
        dom_element: 'skeletonviewer',
        WIDTH: this.skelRef.current.clientWidth,
        HEIGHT: this.skelRef.current.clientHeight,
        colors: swcs.map(swc => swc.get('color')),
      });
      sharkViewer.init();
      sharkViewer.animate();
      swcs.forEach(swc => {
        sharkViewer.loadNeuron(swc.get('name'), swc.get('color'), swc.get('swc'), moveCamera);
      });

      rois.forEach(roi => {
        const reader = new FileReader();

        reader.addEventListener("loadend", () => {
          sharkViewer.loadCompartment(roi.get('name'), roi.get('color'), reader.result, moveCamera);
        });

        db.getAttachment(roi.get('name'), 'obj').then(obj => {
          reader.readAsText(obj);
        });
      });

      if (cameraPosition) {
        const {coords, target} = cameraPosition;
        sharkViewer.restoreView(coords.x, coords.y, coords.z, target);
      }

      sharkViewer.render();
      sharkViewer.render();
      this.setState({sharkViewer});
    }
  };

  loadShark = (swcs, rois) => {
    const { cameraPosition } = this.props;
    const { sharkViewer, db } = this.state;
    // check here to see if we have added or removed neurons.
    const names = {};
    const roiNames = {};
    const moveCamera = !cameraPosition;
    swcs.forEach(swc => {
      // If added, then add them to the scene.
      const exists = sharkViewer.scene.getObjectByName(swc.get('name'));
      if (!exists) {
        sharkViewer.loadNeuron(swc.get('name'), swc.get('color'), swc.get('swc'), moveCamera);
      }
      // if hidden, then hide them.
      sharkViewer.setNeuronVisible(swc.get('name'), swc.get('visible'));
      // push name onto lookup for later use;
      names[swc.get('name')] = 1;
    });

    rois.forEach(roi => {
      const exists = sharkViewer.scene.getObjectByName(roi.get('name'));
      if (!exists) {
        const reader = new FileReader();

        reader.addEventListener("loadend", () => {
          sharkViewer.loadCompartment(roi.get('name'), roi.get('color'), reader.result, moveCamera);
        });

        db.getAttachment(roi.get('name'), 'obj').then(obj => {
          reader.readAsText(obj);
        });
      }
      roiNames[roi.get('name')] = 1;
    });

    // If removed, then remove them.
    // for this we have to loop over the objects in the scene and see if they are
    // missing from the state.
    sharkViewer.scene.children.forEach(child => {
      if (child.type === 'Object3D') {
        if (!names[child.name]) {
          sharkViewer.unloadNeuron(child.name);
        }
      }
       if (child.type === 'Group') {
        if (!roiNames[child.name]) {
          sharkViewer.unloadCompartment(child.name);
        }
      }

    });

    sharkViewer.render();
    sharkViewer.render();
    // UGLY: there is a weird bug that means sometimes the scene is rendered blank.
    // it seems to be some sort of timing issue, and adding a delayed render seems
    // to fix it.
    setTimeout(() => {
      sharkViewer.render();
    }, 200);
  };

  render() {
    const { classes, display, neurons } = this.props;

    if (!display) {
      return null;
    }

    const chips = neurons
      .map(neuron => {
        // gray out the chip if it is not active.
        let currcolor = neuron.get('color');
        if (!neuron.get('visible')) {
          currcolor = 'gray';
        }

        const name = neuron.get('name');

        return (
          <Chip
            key={name}
            label={name}
            onDelete={this.handleDelete(name)}
            onClick={this.handleClick(name)}
            className={classes.chip}
            style={{ background: currcolor }}
          />
        );
      })
      .toArray();

    return (
      <div className={classes.root}>
        <div className={classes.floater}>{chips}</div>
        <div className={classes.footer}><CompartmentSelection /></div>
        <div className={classes.skel} ref={this.skelRef} id="skeletonviewer" />
      </div>
    );
  }
}

Skeleton.propTypes = {
  display: PropTypes.bool.isRequired,
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  neurons: PropTypes.object.isRequired,
  compartments: PropTypes.object.isRequired,
  cameraPosition: PropTypes.object
};

Skeleton.defaultProps = {
  cameraPosition: null
}

const SkeletonState = state => ({
  neurons: state.skeleton.get('neurons'),
  compartments: state.skeleton.get('compartments'),
  display: state.skeleton.get('display'),
  cameraPosition: state.skeleton.get('cameraPosition')
});

const SkeletonDispatch = dispatch => ({
  actions: {
    skeletonNeuronToggle: id => {
      dispatch(skeletonNeuronToggle(id));
    },
    skeletonRemove: id => {
      dispatch(skeletonRemove(id));
    },
    setView: coords => {
      dispatch(setView(coords));
    }
  }
});

export default withStyles(styles)(
  connect(
    SkeletonState,
    SkeletonDispatch
  )(Skeleton)
);
