/*
 * Supports simple, custom neo4j query.
*/
import React from 'react';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import queryNeuronMeta from '../../neo4jqueries/neuronMeta';

export default class NeuronMeta extends React.Component {
  static get queryName() {
    return 'Neuron Meta';
  }

  static get queryDescription() {
    return 'Provides information on the types of meta data stored for neurons.  Clicking on a different property type name in the resulting table provides a list of unique names for that type stored in the database.';
  }

  render() {
    return (
      <Button
        variant="contained"
        onClick={() => {
          this.props.callback(queryNeuronMeta(this.props.datasetstr));
        }}
      >
        Submit
      </Button>
    );
  }
}

NeuronMeta.propTypes = {
  callback: PropTypes.func.isRequired,
  datasetstr: PropTypes.string.isRequired
};
