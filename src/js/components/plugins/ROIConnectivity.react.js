/*
 * Supports simple, custom neo4j query.
*/

"use strict"

import React from 'react';
import Button from 'material-ui/Button';
import PropTypes from 'prop-types';

// TODO: implement ROI connectivity query
var queryROIConnections = function () {}

export default class ROIConnectivity extends React.Component {
    static get queryName() {
        return "ROI Connectivity";
    }
    
    static get queryDescription() {
        return "Extract connectivity matrix for a dataset";
    }
 
    render() {
        return (
                    <Button
                        variant="raised"
                        onClick={() => {
                            queryROIConnections(this.props.callback, 
                                this.props.datasets, this.props.rois);
                        }}
                    >
                        Submit
                    </Button>
        );
    }
}

ROIConnectivity.propTypes = {
    callback: PropTypes.func.isRequired,
    datasets: PropTypes.array.isRequired,
    rois: PropTypes.array.isRequired
};

