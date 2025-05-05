/*
 * Query to view a cell type summary card.
 */
import React from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import withStyles from '@mui/styles/withStyles';

import CellTypeInputField from './shared/CellTypeInputField';

const pluginName = 'Cell Types';
const pluginAbbrev = 'ct';

const columnHeaders = ['id', 'instance', 'type', '#connections'];

const styles = theme => ({
  formControl: {
    margin: theme.spacing(1)
  },
  button: {
    zIndex: 0
  }
});

class CellType extends React.Component {
  static get details() {
    return {
      name: pluginName,
      displayName: pluginName,
      abbr: pluginAbbrev,
      category: 'top-level',
      description: 'Cell Type overview',
      visType: 'CellTypeView'
    };
  }

  static getColumnHeaders() {
    return columnHeaders.map(column => ({ name: column, status: true }));
  }

  static fetchParameters(params) {
    const { cellType, dataset } = params;
    return {
      queryString: `/npexplorer/celltype/${dataset}/${cellType}`
    };
  }

  static processResults({ query, apiResponse }) {
    return {
      data: apiResponse,
      debug: "This plugin doesn't use cypher",
      title: `Details for ${query.pm.cellType} in ${query.pm.dataset}`
    };
  }

  static processDownload(response) {
    const data = response.result.data
      .map(row => [row[0], row[2], row[3], row[1]])
    data.unshift(columnHeaders)
    return data;
  }

  constructor(props) {
    super(props);
    this.state = {
      cellType: ''
    };
  }

  // creates query object and sends to callback
  processRequest = () => {
    const { dataSet, submit } = this.props;
    const { cellType } = this.state;
    const query = {
      dataSet,
      plugin: pluginName,
      pluginCode: pluginAbbrev,
      parameters: {
        dataset: dataSet,
        cellType
      }
    };
    submit(query);
  };

  addCellType = selected => {
    this.setState({ cellType: selected });
  };

  render() {
    const { isQuerying, classes, dataSet } = this.props;
    const { cellType } = this.state;
    return (
      <div>
        <InputLabel>Cell Type Name</InputLabel>
        <CellTypeInputField
          onChange={this.addCellType}
          value={cellType}
          dataSet={dataSet}
        />
        <Button
          className={classes.button}
          variant="contained"
          color="primary"
          disabled={isQuerying}
          onClick={this.processRequest}
        >
          Submit
        </Button>
      </div>
    );
  }
}

CellType.propTypes = {
  dataSet: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
  isQuerying: PropTypes.bool.isRequired,
  submit: PropTypes.func.isRequired
};

export default withStyles(styles)(CellType);
