/*
 * Query to find autapses in the volume.
*/
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import randomColor from 'randomcolor';
import { withRouter } from 'react-router';

import Button from '@material-ui/core/Button';

import { submit } from 'actions/plugins';
import { getQueryString } from 'helpers/queryString';

const pluginName = 'Autapses';

class Autapses extends React.Component {
  static get queryName() {
    return 'Autapses';
  }

  static get queryCategory() {
    return 'recon';
  }

  static get queryDescription() {
    return 'Finds all the self connections (loops) in the dataset.';
  }

  static get isExperimental() {
    return true;
  }

  processResults = (query, apiResponse) => {
    const data = apiResponse.data.map(row => [row[0], row[2], row[1]]);

    return {
      columns: ['id', 'name', '#connections'],
      data,
      debug: apiResponse.debug
    };
  };

  // creates query object and sends to callback
  processRequest = () => {
    const { dataSet, actions, history } = this.props;
    const query = {
      dataSet,
      queryString: '/npexplorer/autapses',
      visType: 'SimpleTable',
      plugin: pluginName,
      parameters: { dataset: dataSet },
      title: 'Number of autapses recorded for each neuron',
      menuColor: randomColor({ luminosity: 'light', hue: 'random' }),
      processResults: this.processResults
    };
    actions.submit(query);
    history.push({
      pathname: '/results',
      search: getQueryString()
    });
    return query;
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

Autapses.propTypes = {
  dataSet: PropTypes.string.isRequired,
  isQuerying: PropTypes.bool.isRequired,
  actions: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

const AutapsesState = state => ({
  isQuerying: state.query.isQuerying
});

// The submit action which will accept your query, execute it and
// store the results for view plugins to display.
const AutapsesDispatch = dispatch => ({
  actions: {
    submit: query => {
      dispatch(submit(query));
    }
  }
});

export default withRouter(
  connect(
    AutapsesState,
    AutapsesDispatch
  )(Autapses)
);
