/*
 * Uses SharkViewer to display a skeleton representation of a neuron
*/

"use strict";

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import _ from "underscore";
import { connect } from 'react-redux';

/*
require('SharkViewer/js/threejs/three.js');
require('SharkViewer/js/threejs/TrackballControls.js');
require('SharkViewer/js/shark_viewer.js');
*/
/* global SharkViewer */

var GlbShark = null;

const styles = theme => ({
  root: {
    width: '100%',
    height: '100%',
    marginTop: theme.spacing.unit * 1,
    backgroundColor: "white"
  },
});

class Skeleton extends React.Component {
    // load skeleton after render takes place
    componentDidMount() {
        let swc = this.fetchSWC(this.props.results); 
        this.createShark(swc); 
    }

    shouldComponentUpdate(nextProps) {
        if (nextProps.disable && GlbShark !== null) {
            GlbShark = null;
            let pardiv = this.refs["skeletonviewer"];
            pardiv.removeChild(pardiv.childNodes[0]);
        }
        
        let swc = this.fetchSWC(nextProps.results); 
        if (this.props.disable && !nextProps.disable) {
            this.createShark(swc);
        } else {
            // update swc if current one is different from previous
            let oldswc = this.fetchSWC(this.props.results); 
            if (!_.isEqual(swc, oldswc)) {
                this.createShark(swc);
            }
        }
        
        return true;
    }

    // grab latest swc added
    fetchSWC = (results) => {
        let swc = {};
        results.map( (result) => {
            if ("isSkeleton" in result[0] && result[0].isSkeleton) {
                swc = result[0].swc;
            }
        });

        return swc;
    }

    createShark = (swc) => {
        if (GlbShark !== null) {
            GlbShark = null;
            let pardiv = this.refs["skeletonviewer"];
            if (pardiv.childNodes.length > 0) {
                pardiv.removeChild(pardiv.childNodes[0]);
            }
        }
        
        if (Object.keys(swc).length !== 0) {
            GlbShark = new SharkViewer({
                swc: swc, 
                dom_element: "skeletonviewer", 
                center_node: -1,
                WIDTH: this.refs["skeletonviewer"].clientWidth,
                HEIGHT: this.refs["skeletonviewer"].clientHeight,
            });

            GlbShark.init();
            GlbShark.animate();
        }
    }

    render() {
        const { classes } = this.props;
        
        return (
            <div 
                    className={classes.root}
                    ref={"skeletonviewer"}
                    id={"skeletonviewer"}
            />
        );
    }
}

Skeleton.propTypes = {
    classes: PropTypes.object.isRequired,
    results: PropTypes.array.isRequired,
    disable: PropTypes.bool.isRequired,
};

var SkeletonState = function(state){
    return {
        results: state.results.allTables,
    }   
};

export default withStyles(styles)(connect(SkeletonState, null)(Skeleton));


