/*
 * Main page holding query selector and query forms.
*/

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Select from 'react-select';

import InputLabel from '@material-ui/core/InputLabel';
import Divider from '@material-ui/core/Divider';
import { withStyles } from '@material-ui/core/styles';

import QueryForm from './QueryForm';
import { getQueryObject, setQueryString } from '../helpers/queryString';

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 3
  },
  divider: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  chip: {
    margin: theme.spacing.unit / 4
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120,
    maxWidth: 300
  },
  formControl2: {
    margin: theme.spacing.unit,
    minWidth: 250,
    maxWidth: 300
  },
  selectWidth: {
    minWidth: 250
  },
  select: {
    fontFamily: theme.typography.fontFamily,
    margin: '0.5em 0 1em 0'
  }
});

class Query extends React.Component {
  constructor(props) {
    super(props);
    const qsParams = getQueryObject();
    this.state = {
      qsParams: qsParams.Query || {}
    };
  }

  setQuery = selectedQuery => {
    const { qsParams } = this.state;
    const { pluginList } = this.props;
    if (selectedQuery.value !== qsParams.queryType) {
      // delete query string from last query
      let found = false;
      if (qsParams) {
        pluginList.forEach(plugin => {
          if (plugin.queryName === qsParams.queryType) {
            found = true;
          }
        });
      }

      if (found) {
        // RemoveQueryString('Query:' + this.state.qsParams.queryType);
      }

      const oldparams = qsParams;
      oldparams.queryType = selectedQuery.value;
      setQueryString({
        Query: {
          queryType: selectedQuery.value
        }
      });
      this.setState({ qsParams: oldparams });
    }
  };

  handleChange = selectedDataSet => {
    const { qsParams } = this.state;
    const newdatasets = [selectedDataSet.value];
    const oldparams = qsParams;
    oldparams.datasets = newdatasets;
    setQueryString({
      Query: {
        datasets: [selectedDataSet.value]
      }
    });
    this.setState({ qsParams: oldparams });
  };

  render() {
    const { classes, pluginList, reconIndex, availableDatasets } = this.props;
    const { qsParams } = this.state;

    let queryname = 'Select Query';
    let querytype = '';
    let datasetstr = 'Select a dataset';

    // if query is selected, pass query along
    if (qsParams) {
      if (qsParams.queryType !== '') {
        // check if query is in the list of plugins
        let found = false;
        pluginList.forEach(plugin => {
          if (plugin.queryName === qsParams.queryType) {
            found = true;
          }
        });

        if (found) {
          queryname = qsParams.queryType;
          querytype = queryname;
        }

        // why is this for loop here? It just sets datsetstr to be
        // the value of the last item in the list.
        qsParams.datasets.forEach(dataset => {
          datasetstr = dataset;
        });
      }
    }

    const generalOptions = pluginList.slice(0, reconIndex).map(val => ({
      value: val.queryName,
      label: val.queryName
    }));

    const reconOptions = pluginList.slice(reconIndex, pluginList.length).map(val => ({
      value: val.queryName,
      label: val.queryName
    }));

    const queryOptions = [
      {
        label: 'General',
        options: generalOptions
      },
      {
        label: 'Reconstruction Related',
        options: reconOptions
      }
    ];

    const dataSetOptions = availableDatasets.map(dataset => ({
      value: dataset,
      label: dataset
    }));

    // TODO: fix default menu option (maybe make the custom query the default)
    return (
      <div className={classes.root}>
        <InputLabel htmlFor="controlled-open-select">Query Type</InputLabel>
        <Select
          className={classes.select}
          value={{ label: queryname, value: queryname }}
          onChange={this.setQuery}
          options={queryOptions}
        />

        <InputLabel htmlFor="select-multiple-chip">Select dataset</InputLabel>
        <Select
          className={classes.select}
          value={{ value: datasetstr, label: datasetstr }}
          onChange={this.handleChange}
          options={dataSetOptions}
        />

        <Divider className={classes.divider} />

        <QueryForm queryType={querytype} datasetstr={datasetstr} dataSet={datasetstr} />
      </div>
    );
  }
}

Query.propTypes = {
  pluginList: PropTypes.arrayOf(PropTypes.func).isRequired,
  reconIndex: PropTypes.number.isRequired,
  classes: PropTypes.object.isRequired,
  availableDatasets: PropTypes.arrayOf(PropTypes.string).isRequired
};

const QueryState = state => ({
  pluginList: state.app.get('pluginList'),
  reconIndex: state.app.get('reconIndex'),
  availableDatasets: state.neo4jsettings.get('availableDatasets')
});

export default withStyles(styles, { withTheme: true })(connect(QueryState)(Query));
