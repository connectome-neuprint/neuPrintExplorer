/* global SharkViewer */
/*
 * Uses SharkViewer to display a skeleton representation of a neuron
*/

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Chip from '@material-ui/core/Chip';
import { skeletonNeuronToggle, skeletonRemove } from 'actions/skeleton';

let GlbShark = null;

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
    this.skelRef = React.createRef();
  }

  // load skeleton after render takes place
  componentDidMount() {
    const { neurons } = this.props;
    const swc = this.fetchSWC(neurons);
    this.createShark(swc);
  }

  componentDidUpdate(prevProps) {
    const { neurons } = this.props;
    if (prevProps.neurons !== neurons) {
      const swc = this.fetchSWC(neurons);
      this.createShark(swc);
    }
  }

  handleDelete = id => () => {
    const { actions } = this.props;
    actions.skeletonRemove(id);
  };

  handleClick = id => () => {
    const { actions } = this.props;
    actions.skeletonNeuronToggle(id);
  };

  // grab latest swc added
  fetchSWC = neurons => {
    const swc = {};
    const colors = [];
    let offset = 0;
    neurons
      .valueSeq()
      .filter(neuron => neuron.get('visible'))
      .forEach((neuron, colorIndex) => {
        offset = this.concatSkel(swc, neuron, offset, colorIndex);
        colors.push(neuron.get('color'));
      });

    return {
      swc,
      colors
    };
  };

  // can we do this better with recursion?
  concatSkel = (newswc, neuron, offset, colorIndex) => {
    let maxRowId = 0;
    const swc = neuron.get('swc');
    for (const rowId in swc) {
      const newId = parseInt(rowId, 10) + offset;
      const val = swc[rowId];
      if (newId > maxRowId) {
        maxRowId = newId;
      }
      newswc[newId] = {
        type: colorIndex,
        x: val.x,
        y: val.y,
        z: val.z,
        parent: val.parent === -1 ? -1 : val.parent + offset,
        radius: val.radius
      };
    }
    return maxRowId + 1;
  };

  createShark = swc => {
    if (GlbShark !== null) {
      GlbShark.scene.remove(GlbShark.neuron);
      GlbShark.scene.remove(GlbShark.camera);
      GlbShark.material.dispose();
      GlbShark.geometry.dispose();

      GlbShark = null;
      const pardiv = this.skelRef.current;
      if (pardiv.childNodes.length > 0) {
        pardiv.removeChild(pardiv.childNodes[0]);
      }
    }

    if (Object.keys(swc.swc).length !== 0) {
      GlbShark = new SharkViewer({
        swc: swc.swc,
        dom_element: 'skeletonviewer',
        center_node: -1,
        WIDTH: this.skelRef.current.clientWidth,
        HEIGHT: this.skelRef.current.clientHeight,
        colors: swc.colors
      });

      GlbShark.init();
      GlbShark.animate();
    }
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
        <div className={classes.skel} ref={this.skelRef} id="skeletonviewer" />
      </div>
    );
  }
}

Skeleton.propTypes = {
  display: PropTypes.bool.isRequired,
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  neurons: PropTypes.object.isRequired
};

const SkeletonState = state => ({
  neurons: state.skeleton.get('neurons'),
  display: state.skeleton.get('display')
});

const SkeletonDispatch = dispatch => ({
  actions: {
    skeletonNeuronToggle: id => {
      dispatch(skeletonNeuronToggle(id));
    },
    skeletonRemove: id => {
      dispatch(skeletonRemove(id));
    }
  }
});

export default withStyles(styles)(
  connect(
    SkeletonState,
    SkeletonDispatch
  )(Skeleton)
);
