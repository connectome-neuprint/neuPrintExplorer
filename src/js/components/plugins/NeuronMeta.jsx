/*
 * Supports simple, custom neo4j query.
*/
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import randomColor from 'randomcolor';

import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';

import { submit } from 'actions/plugins';
import { getQueryString } from 'helpers/queryString';

const styles = () => ({});

const pluginName = 'NeuronMeta';

class NeuronMeta extends React.Component {
  static get queryName() {
    return 'Neuron Meta';
  }

  static get queryDescription() {
    return 'Provides information on the types of meta data stored for neurons.  Clicking on a different property type name in the resulting table provides a list of unique names for that type stored in the database.';
  }

  processMetaValues = (query, apiResponse) => {
    const data = apiResponse.data.map(row => [row[0]]);

    return {
      columns: ['Property Value'],
      data,
      debug: apiResponse.debug
    };
  }

  processResults = (query, apiResponse) => {
    const { actions, dataSet } = this.props;
    const data = apiResponse.data.map(row => {
      const valuesQuery = {
        queryString: '/npexplorer/neuronmetavals',
        parameters: { dataset: dataSet, key_name: row[0] },
        dataSet: query.dataSet, // <string> for the data set selected
        visType: 'SimpleTable', // <string> which visualization plugin to use. Default is 'table'
        plugin: pluginName, // <string> the name of this plugin.
        title: `Distinct values for property type: ${row[0]}`,
        menuColor: randomColor({ luminosity: 'light', hue: 'random' }),
        processResults: this.processMetaValues
      };

      return [
        {
          value: row[0],
          action: () => actions.submit(valuesQuery)
        }
      ];
    });

    return {
      columns: ['Property Name'],
      data,
      debug: apiResponse.debug
    };
  };

  processRequest = () => {
    const { dataSet, actions, history } = this.props;
    const parameters = {
      dataset: dataSet
    };

    const query = {
      dataSet, // <string> for the data set selected
      queryString: '/npexplorer/neuronmeta',
      visType: 'SimpleTable',
      visProps: { rowsPerPage: 10 },
      plugin: pluginName, // <string> the name of this plugin.
      parameters, // <object>
      title: `Distinct property types found in dataset: ${dataSet}`,
      menuColor: randomColor({ luminosity: 'light', hue: 'random' }),
      processResults: this.processResults
    };
    actions.submit(query);
    // redirect to the results page.
    history.push({
      pathname: '/results',
      search: getQueryString()
    });
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
  actions: PropTypes.object.isRequired,
  dataSet: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
  isQuerying: PropTypes.bool.isRequired
};

const NeuronMetaState = state => ({
  isQuerying: state.query.isQuerying
});

// The submit action which will accept your query, execute it and
// store the results for view plugins to display.
const NeuronMetaDispatch = dispatch => ({
  actions: {
    submit: query => {
      dispatch(submit(query));
    }
  }
});

// boiler plate for redux.
export default withRouter(
  withStyles(styles)(
    connect(
      NeuronMetaState,
      NeuronMetaDispatch
    )(NeuronMeta)
  )
);
