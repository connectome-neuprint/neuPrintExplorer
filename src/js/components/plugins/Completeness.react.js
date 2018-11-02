/*
 * Queries completeness of reconstruction with respect to neuron filters.
*/
import React from 'react';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import NeuronFilter from '../NeuronFilter.react';
import queryCompleteness from '../../neo4jqueries/completeness';

export default class Completeness extends React.Component {
  static get queryName() {
    return 'Completeness';
  }

  static get queryDescription() {
    return 'Determines the reconstruction completeness of each ROI with respect to the neuron filters';
  }

  constructor(props) {
    super(props);

    this.state = {
      limitBig: true,
      statusFilters: []
    };
  }

  loadNeuronFilters = params => {
    this.setState({ limitBig: params.limitBig, statusFilters: params.statusFilters });
  };

  render() {
    return (
      <div>
        <NeuronFilter callback={this.loadNeuronFilters} datasetstr={this.props.datasetstr} />
        <Button
          variant="contained"
          onClick={() => {
            this.props.callback(
              queryCompleteness(
                this.props.datasetstr,
                this.props.availableROIs,
                this.state.limitBig,
                this.state.statusFilters
              )
            );
          }}
        >
          Submit
        </Button>
      </div>
    );
  }
}

Completeness.propTypes = {
  callback: PropTypes.func.isRequired,
  datasetstr: PropTypes.string.isRequired,
  availableROIs: PropTypes.array.isRequired
};
