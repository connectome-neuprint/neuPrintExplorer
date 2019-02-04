/*
 * Uses SharkViewer to display a skeleton representation of a neuron
 */

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Chip from '@material-ui/core/Chip';
import { skeletonNeuronToggle, skeletonRemove } from 'actions/skeleton';

import SharkViewer from '@janelia/sharkviewer';
import { swcParser } from '@janelia/sharkviewer/dist/viewer/util';

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
    this.state = {
      sharkViewer: {
        animate: () => {}
      }
    };
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
      this.loadShark(swc);
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
    let swc = {};
    const colors = [];
    let offset = 0;
    neurons
      .valueSeq()
      .filter(neuron => neuron.get('visible'))
      .forEach((neuron, colorIndex) => {
        [offset, swc] = this.concatSkel(swc, neuron, offset, colorIndex);
        colors.push(neuron.get('color'));
      });

    return {
      swc,
      colors
    };
  };

  // can we do this better with recursion?
  concatSkel = (mainswc, neuron, offset, colorIndex) => {
    const newSWC = mainswc;
    let maxRowId = 0;
    const swc = neuron.get('swc');
    Object.entries(swc).forEach(entry => {
      const [rowName, rowData] = entry;
      const newId = parseInt(rowName, 10) + offset;
      if (newId > maxRowId) {
        maxRowId = newId;
      }
      newSWC[newId] = {
        type: colorIndex,
        x: rowData.x,
        y: rowData.y,
        z: rowData.z,
        parent: rowData.parent === -1 ? -1 : rowData.parent + offset,
        radius: rowData.radius
      };
    });

    return [maxRowId + 1, newSWC];
  };

  createShark = swc => {
    const swcTxt = [
      '# ORIGINAL_SOURCE NeuronStudio 0.8.80',
      '# CREATURE',
      '# REGION',
      '# FIELD/LAYER',
      '# TYPE',
      '# CONTRIBUTOR',
      '# REFERENCE',
      '# RAW',
      '# EXTRAS',
      '# SOMA_AREA',
      '# SHINKAGE_CORRECTION 1.0 1.0 1.0',
      '# VERSION_NUMBER 1.0',
      '# VERSION_DATE 2007-07-24',
      '# SCALE 1.0 1.0 1.0',
      '1 1 14.566132 34.873772 7.857000 0.717830 -1',
      '2 0 16.022520 33.760513 7.047000 0.463378 1',
      '3 5 17.542000 32.604973 6.885001 0.638007 2',
      '4 0 19.163984 32.022469 5.913000 0.602284 3',
      '5 0 20.448090 30.822802 4.860000 0.436025 4',
      '6 6 21.897903 28.881084 3.402000 0.471886 5',
      '7 0 18.461960 30.289471 8.586000 0.447463 3',
      '8 6 19.420759 28.730757 9.558000 0.496217 7'
    ].join('\n');
    const swcTest = swcParser(swcTxt);
    const sharkViewer = new SharkViewer({
      dom_element: this.skelRef.current,
      // center_node: -1,
      // centerpoint: [24, 18, 0],
      // WIDTH: this.skelRef.current.clientWidth,
      // HEIGHT: this.skelRef.current.clientHeight,
    });
    sharkViewer.init();
    sharkViewer.animate();
    sharkViewer.loadNeuron('swc', null, swcTest);
    window.s = sharkViewer;
    this.setState({ sharkViewer });
  };

  /* createShark = swc => {
    if (Object.keys(swc.swc).length !== 0) {
      if (GlbShark === null) {
        GlbShark = new SharkViewer({
          dom_element: 'skeletonviewer',
          // center_node: -1,
          // centerpoint: [24,18,0],
          WIDTH: this.skelRef.current.clientWidth,
          HEIGHT: this.skelRef.current.clientHeight,
          colors: swc.colors
        });

        GlbShark.init();
        GlbShark.animate();
      }
      GlbShark.loadNeuron('swc', null, swc.swc);
    }
  }; */

  loadShark = swc => {
    const { sharkViewer } = this.state;
    console.log('adding neurons');
    sharkViewer.animate();
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
