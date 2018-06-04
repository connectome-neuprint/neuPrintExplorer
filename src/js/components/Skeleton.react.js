/*
 * Uses SharkViewer to display a skeleton representation of a neuron
*/

"use strict";

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

/*
require('SharkViewer/js/threejs/three.js');
require('SharkViewer/js/threejs/TrackballControls.js');
require('SharkViewer/js/shark_viewer.js');
*/
/* global SharkViewer */

const styles = theme => ({
  root: {
    width: '100%',
    height: '100%',
    marginTop: theme.spacing.unit * 1,
  },
});

class Skeleton extends React.Component {
    // load skeleton after render takes place
    componentDidMount() {
        if (Object.keys(this.props.swc).length !== 0) {
            let s = new SharkViewer({
                swc: this.props.swc, 
                dom_element: this.props.uniqueId, 
                center_node: -1,
                WIDTH: this.refs[this.props.uniqueId].clientWidth,
                HEIGHT: this.refs[this.props.uniqueId].clientHeight,
            });

            s.init();
            s.animate();

            this.setState({
                skelobj: s
            });
        }
    }

    render() {
        const { classes } = this.props;
        return (
            <div 
                    className={classes.root}
                    ref={this.props.uniqueId}
                    id={this.props.uniqueId}
            />
        );
    }
}

Skeleton.propTypes = {
    classes: PropTypes.object.isRequired,
    swc: PropTypes.object.isRequired,
    uniqueId: PropTypes.number.isRequired
};


export default withStyles(styles)(Skeleton);


