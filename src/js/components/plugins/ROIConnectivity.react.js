/*
 * Supports simple, custom neo4j query.
*/

"use strict"

import React from 'react';
import Button from 'material-ui/Button';
import PropTypes from 'prop-types';
import queryROIConnections from '../../neo4jqueries/roiConnectivity';

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
                            this.props.callback(queryROIConnections(this.props.datasetstr, this.props.availableROIs));
                        }}
                    >
                        Submit
                    </Button>
        );
    }
}

ROIConnectivity.propTypes = {
    callback: PropTypes.func.isRequired,
    datasetstr: PropTypes.string.isRequired,
    availableROIs: PropTypes.array.isRequired
};

