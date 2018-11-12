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

var GlbShark = null;

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
    right: '1em',
  }
});

class Skeleton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hideIndices: new Set()
    };
  }

  // load skeleton after render takes place
  componentDidMount() {
    let swc = this.fetchSWC(this.props.neurons);
    this.createShark(swc);
  }

  componentDidUpdate() {
    let swc = this.fetchSWC(this.props.neurons);
    this.createShark(swc);
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

  concatSkel = (newswc, neuron, offset, colorIndex) => {
    let maxRowId = 0;
    const swc = neuron.get('swc');
    for (let rowId in swc) {
      let newId = parseInt(rowId) + offset;
      let val = swc[rowId];
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
      let pardiv = this.refs['skeletonviewer'];
      if (pardiv.childNodes.length > 0) {
        pardiv.removeChild(pardiv.childNodes[0]);
      }
    }

    if (Object.keys(swc.swc).length !== 0) {
      GlbShark = new SharkViewer({
        swc: swc.swc,
        dom_element: 'skeletonviewer',
        center_node: -1,
        WIDTH: this.refs['skeletonviewer'].clientWidth,
        HEIGHT: this.refs['skeletonviewer'].clientHeight,
        colors: swc.colors
      });

      GlbShark.init();
      GlbShark.animate();
    }
  };

  render() {
    const { classes, display, actions, fullscreen } = this.props;

    if (!display) {
      return null;
    }

    let chips = this.props.neurons
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
        <div className={classes.skel} ref={'skeletonviewer'} id={'skeletonviewer'} />
      </div>
    );
  }
}

Skeleton.propTypes = {
  display: PropTypes.bool.isRequired,
  actions: PropTypes.object.isRequired,
  fullscreen: PropTypes.bool.isRequired,
};

var SkeletonState = function(state) {
  return {
    neurons: state.skeleton.get('neurons'),
    display: state.skeleton.get('display'),
    fullscreen: state.app.get('fullscreen')
  };
};

var SkeletonDispatch = dispatch => ({
  actions: {
    skeletonNeuronToggle: id => {
      dispatch(skeletonNeuronToggle(id));
    },
    skeletonRemove: id => {
      dispatch(skeletonRemove(id));
    },
  }
});

export default withStyles(styles)(
  connect(
    SkeletonState,
    SkeletonDispatch
  )(Skeleton)
);
