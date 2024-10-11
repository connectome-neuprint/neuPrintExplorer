/*
 * Query to find autapses in the volume.
 */
import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';

import { getBodyIdForTable } from './shared/pluginhelpers';

const pluginName = 'Autapses';
const pluginAbbrev = 'au';

const columnHeaders = ['id', 'instance', 'type', '#connections'];

class Autapses extends React.Component {
  static get details() {
    return {
      name: pluginName,
      displayName: pluginName,
      abbr: pluginAbbrev,
      category: 'recon',
      description: 'Finds all the self connections (loops) in the dataset.',
      visType: 'SimpleTable'
    };
  }

  static getColumnHeaders() {
    return columnHeaders.map(column => ({name: column, status: true}));
  }

  static fetchParameters() {
    return {
      queryString: '/npexplorer/autapses'
    };
  }

  static processResults({ query, apiResponse, actions }) {
    const data = apiResponse.data.map(row => [
      getBodyIdForTable(query.ds, row[0], actions),
      row[2],
      row[3],
      row[1]
    ]);

    return {
      columns: columnHeaders,
      data,
      debug: apiResponse.debug,
      title: `Number of autapses recorded for each neuron in ${query.pm.dataset}`
    };
  }

  static processDownload(response) {
    const data = response.result.data
      .map(row => [row[0], row[2], row[3], row[1]])
    data.unshift(columnHeaders);
    return data;
  }

  // creates query object and sends to callback
  processRequest = () => {
    const { dataSet, submit } = this.props;
    const query = {
      dataSet,
      plugin: pluginName,
      pluginCode: pluginAbbrev,
      parameters: { dataset: dataSet }
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

Autapses.propTypes = {
  dataSet: PropTypes.string.isRequired,
  isQuerying: PropTypes.bool.isRequired,
  submit: PropTypes.func.isRequired
};

export default Autapses;
