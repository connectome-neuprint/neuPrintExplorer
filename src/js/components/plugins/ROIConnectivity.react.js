/*
 * Supports simple, custom neo4j query.
*/
import React from 'react';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import queryROIConnections from '../../neo4jqueries/roiConnectivity';

export default class ROIConnectivity extends React.Component {
  static get queryName() {
    return 'ROI Connectivity';
  }

  static get queryDescription() {
    return 'Extract connectivity matrix for a dataset';
  }

  render() {
    return (
      <Button
        variant="contained"
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
