/*
 * Uses SharkViewer to display a skeleton representation of a neuron
*/

"use strict";

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import _ from "underscore";
import { connect } from 'react-redux';
import Chip from 'material-ui/Chip';
import C from "../reducers/constants"


/*
require('SharkViewer/js/threejs/three.js');
require('SharkViewer/js/threejs/TrackballControls.js');
require('SharkViewer/js/shark_viewer.js');
*/
/* global SharkViewer */

var COLORS = [
    0xe41a1c,
    0x377eb8,
    0x4daf4a,
    0x984ea3,
    0xff7f00,
    0xffff33,
    0xa65628,
    0xf781bf,
    0x999999,
];

var COLORSHTML = [
    "#e41a1c",
    "#377eb8",
    "#4daf4a",
    "#984ea3",
    "#ff7f00",
    "#ffff33",
    "#a65628",
    "#f781bf",
    "#999999",
];



var GlbShark = null;

const styles = theme => ({
  root: {
    width: '100%',
    height: '100%',
    marginTop: theme.spacing.unit * 1,
    backgroundColor: "white"
  },
  floater: {
    zIndex: 2,
    padding: theme.spacing.unit,
    position: "absolute"
  },
  skel: {
    width: '100%',
    height: '100%',
    zIndex: 1,
    position: "relative"
  },
  chip: {
    margin: theme.spacing.unit / 2,
  },
});

class Skeleton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hideIndices: new Set()
        }
    }
    
    // load skeleton after render takes place
    componentDidMount() {
        let swc = this.fetchSWC(this.props.results, this.props.clearIndices, this.state.hideIndices); 
        this.createShark(swc); 
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.disable && GlbShark !== null) {
            GlbShark = null;
            let pardiv = this.refs["skeletonviewer"];
            pardiv.removeChild(pardiv.childNodes[0]);
        }

        let swc = this.fetchSWC(nextProps.results, nextProps.clearIndices, nextState.hideIndices); 
  
        if (this.props.disable && !nextProps.disable) {
            this.createShark(swc);
        } else {
            // update swc if current one is different from previous
            let oldswc = this.fetchSWC(this.props.results, this.props.clearIndices, this.state.hideIndices); 
            if (!_.isEqual(swc, oldswc)) {
                this.createShark(swc);
            }
        }
        
        return true;
    }

    handleDelete = data => () => {
        this.props.clearResult(data[0]);
    }
    
    handleClick = data => () => {
        let hideIds = new Set(this.state.hideIndices);
        if (hideIds.has(data[0])) {
            hideIds.delete(data[0]);
        } else {
            hideIds.add(data[0]);
        }
        this.setState({hideIndices: hideIds});
    }

    // grab latest swc added
    fetchSWC = (results, clearIndices, hideIndices) => {
        let swc = {};
        let offset = 0;
        results.map( (result, index) => {
            if ((!hideIndices.has(index)) && (!clearIndices.has(index)) && ("isSkeleton" in result[0]) && (result[0].isSkeleton)) {
                offset = this.concatSkel(swc, result[0].swc, offset);
            }
        });

        return swc;
    }

    concatSkel = (newswc, origswc, offset) => {
        let maxRowId = 0;
        for (let rowId in origswc) {
            let newId = parseInt(rowId) + offset;
            let val = origswc[rowId];
            if (newId > maxRowId) {
                maxRowId = newId;
            }
            newswc[newId] = {
                type: (val.type % COLORS.length),
                x: val.x,
                y: val.y,
                z: val.z,
                parent: (val.parent === -1) ? -1 : (val.parent + offset),
                radius: val.radius
            }
        }

        return maxRowId + 1;
    }

    createShark = (swc) => {
        if (GlbShark !== null) {
            GlbShark.scene.remove(GlbShark.neuron);
            GlbShark.scene.remove(GlbShark.camera);
            GlbShark.material.dispose();
            GlbShark.geometry.dispose();
            
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
                colors: COLORS,
            });

            GlbShark.init();
            GlbShark.animate();
        }
    }

    render() {
        const { classes } = this.props;
      
        let chipsArr = [];
        this.props.results.map( (result, index) => {
            if ((!this.props.clearIndices.has(index)) && ("isSkeleton" in result[0]) && (result[0].isSkeleton)) {
                chipsArr.push([index, result[0].name]);
            }
        });

        return (
            <div 
                    className={classes.root}
            >
                <div className={classes.floater}>
                {chipsArr.map(data => {
                    let currcolor = COLORSHTML[parseInt(data[1])%COLORS.length];
                    if (this.state.hideIndices.has(data[0])) {
                        currcolor = "gray";
                    }

                    return (
                        <Chip
                                key={data[0]}
                                label={data[1]}
                                onDelete={this.handleDelete(data)}
                                onClick={this.handleClick(data)}
                                className={classes.chip}
                                style={{'background': currcolor }}
                        />
                    );
                })}
            
                </div>
                <div
                    className={classes.skel}
                    ref={"skeletonviewer"}
                    id={"skeletonviewer"}
                />
            </div>
        );
    }
}

Skeleton.propTypes = {
    classes: PropTypes.object.isRequired,
    results: PropTypes.array.isRequired,
    disable: PropTypes.bool.isRequired,
    clearResult: PropTypes.func.isRequired,
    clearIndices: PropTypes.object.isRequired,
    numClear: PropTypes.number.isRequired,
};

var SkeletonState = function(state){
    return {
        results: state.results.allTables,
        clearIndices: state.results.clearIndices,
        numClear: state.results.numClear,
    }   
};

var SkeletonDispatch = function(dispatch) {
   return {
        clearResult: function(index) {
            dispatch({
                type: C.CLEAR_RESULT,
                index: index
            });
        }
   }
}

export default withStyles(styles)(connect(SkeletonState, SkeletonDispatch)(Skeleton));


