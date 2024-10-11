/*
 * Supports simple, custom neo4j query.
 */
import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';

const styles = () => ({});

const pluginName = 'NeuronMeta';
const pluginAbbrev = 'nm';

function processMetaValues(query, apiResponse) {
  const data = apiResponse.data.map(row => [row[0]]);

  return {
    columns: ['Property Value'],
    data,
    debug: apiResponse.debug,
    title: `Distinct values for property type: ${query.pm.key_name}`
  };
}

class NeuronMeta extends React.Component {
  static get details() {
    return {
      name: pluginName,
      displayName: 'Neuron Meta',
      abbr: pluginAbbrev,
      description:
        'Provides information on the types of meta data stored for neurons.  Clicking on a different property type name in the resulting table provides a list of unique names for that type stored in the database.',
      visType: 'SimpleTable'
    };
  }

  static getColumnHeaders(query) {
    if (query.pm.key_name) {
      return [{ name: 'Property Value', status: true }];
    }
    return [{ name: 'Property Name', status: true }];
  }

  static fetchParameters(params) {
    // return the cypher Query and the api end point based on the parameters
    // received.
    if (params.key_name) {
      return {
        queryString: '/npexplorer/neuronmetavals'
      };
    }
    // the default response
    return {
      queryString: '/npexplorer/neuronmeta'
    };
  }

  static processResults({ query, apiResponse, submitFunc }) {
    if (query.pm.key_name) {
      return processMetaValues(query, apiResponse);
    }

    const data = apiResponse.data.map(row => {
      const valuesQuery = {
        parameters: { dataset: query.pm.dataset, key_name: row[0] },
        dataSet: query.dataSet, // <string> for the data set selected
        plugin: pluginName, // <string> the name of this plugin.
        pluginCode: pluginAbbrev
      };

      return [
        {
          value: row[0],
          action: () => submitFunc(valuesQuery)
        }
      ];
    });

    return {
      columns: ['Property Name'],
      data,
      debug: apiResponse.debug,
      title: `Distinct property types found in dataset: ${query.pm.dataset}`
    };
  }

  processRequest = () => {
    const { dataSet, submit } = this.props;
    const parameters = {
      dataset: dataSet
    };

    const query = {
      dataSet, // <string> for the data set selected
      plugin: pluginName, // <string> the name of this plugin.
      pluginCode: pluginAbbrev,
      parameters // <object>
    };
    submit(query);
  };

  render() {
    const { isQuerying } = this.props;
    return (
      <Button
        disabled={isQuerying}
        color="primary"
        variant="contained"
        onClick={this.processRequest}
      >
        Submit
      </Button>
    );
  }
}

NeuronMeta.propTypes = {
  submit: PropTypes.func.isRequired,
  dataSet: PropTypes.string.isRequired,
  isQuerying: PropTypes.bool.isRequired
};

// boiler plate for redux.
export default withStyles(styles)(NeuronMeta);
