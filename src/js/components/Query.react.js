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

import QueryForm from './QueryForm.react';
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
      qsParams: qsParams.Query || {},
    };
  }

  setQuery = selectedQuery => {
    const { qsParams } = this.state;
    if (selectedQuery.value !== qsParams.queryType) {
      // delete query string from last query
      var found = false;
      for (var i in this.props.pluginList) {
        if (qsParams && qsParams.queryType === this.props.pluginList[i].queryName) {
          found = true;
        }
      }

      if (found) {
        // RemoveQueryString('Query:' + this.state.qsParams.queryType);
      }

      var oldparams = qsParams;
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
    var newdatasets = [selectedDataSet.value];
    var oldparams = qsParams;
    oldparams.datasets = newdatasets;
    setQueryString({
      Query: {
        datasets: [selectedDataSet.value]
      }
    });
    this.setState({ qsParams: oldparams });
  };

  render() {
    const { classes } = this.props;
    const { qsParams } = this.state;

    var queryname = 'Select Query';
    var querytype = '';
    var datasetstr = 'Select a dataset';

    // if query is selected, pass query along
    if (qsParams) {
      if (qsParams.queryType !== '') {
        // check if query is in the list of plugins
        var found = false;
        for (var i in this.props.pluginList) {
          if (qsParams.queryType === this.props.pluginList[i].queryName) {
            found = true;
          }
        }
        if (found) {
          queryname = qsParams.queryType;
          querytype = queryname;
        }

        for (var item in qsParams.datasets) {
          datasetstr = qsParams.datasets[item];
        }
      }
    }

    const generalOptions = this.props.pluginList.slice(0, this.props.reconIndex).map(val => {
      return {
        value: val.queryName,
        label: val.queryName
      };
    });

    const reconOptions = this.props.pluginList
      .slice(this.props.reconIndex, this.props.pluginList.length)
      .map(val => {
        return {
          value: val.queryName,
          label: val.queryName
        };
      });

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

    const dataSetOptions = this.props.availableDatasets.map(dataset => {
      return {
        value: dataset,
        label: dataset
      };
    });

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
  pluginList: PropTypes.array.isRequired,
  reconIndex: PropTypes.number.isRequired,
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  availableDatasets: PropTypes.array.isRequired
};

var QueryState = function(state) {
  return {
    pluginList: state.app.get('pluginList'),
    reconIndex: state.app.get('reconIndex'),
    availableDatasets: state.neo4jsettings.availableDatasets
  };
};

var QueryDispatch = function(dispatch) {
  return {};
};

export default withStyles(styles, { withTheme: true })(
  connect(
    QueryState,
    QueryDispatch
  )(Query)
);
