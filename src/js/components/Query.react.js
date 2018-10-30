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
import { LoadQueryString, SaveQueryString, RemoveQueryString } from '../helpers/qsparser';

import QueryForm from './QueryForm.react';
import { setUrlQS } from '../actions/app';

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
    var initqsParams = {
      queryType: '',
      datasets: []
    };
    var qsParams = LoadQueryString('Query', initqsParams, this.props.urlQueryString);
    if (qsParams.datasets.length === 0 && this.props.availableDatasets.length > 0) {
      qsParams.datasets = [this.props.availableDatasets[0]];
      this.props.setURLQs(SaveQueryString('Query', qsParams));
    }
    this.state = {
      qsParams: qsParams
    };
  }

  setQuery = selectedQuery => {
    if (selectedQuery.value !== this.state.qsParams.queryType) {
      // delete query string from last query
      var found = false;
      for (var i in this.props.pluginList) {
        if (this.state.qsParams.queryType === this.props.pluginList[i].queryName) {
          found = true;
        }
      }

      if (found) {
        RemoveQueryString('Query:' + this.state.qsParams.queryType);
      }

      var oldparams = this.state.qsParams;
      oldparams.queryType = selectedQuery.value;
      this.props.setURLQs(SaveQueryString('Query', oldparams));
      this.setState({ qsParams: oldparams });
    }
  };

  handleChange = selectedDataSet => {
    var newdatasets = [selectedDataSet.value];
    var oldparams = this.state.qsParams;
    oldparams.datasets = newdatasets;
    this.props.setURLQs(SaveQueryString('Query', oldparams));

    this.setState({ qsParams: oldparams });
  };

  render() {
    const { classes } = this.props;

    var queryname = 'Select Query';
    var querytype = '';

    // if query is selected, pass query along
    if (this.state.qsParams.queryType !== '') {
      // check if query is in the list of plugins
      var found = false;
      for (var i in this.props.pluginList) {
        if (this.state.qsParams.queryType === this.props.pluginList[i].queryName) {
          found = true;
        }
      }
      if (found) {
        queryname = this.state.qsParams.queryType;
        querytype = queryname;
      }
    }

    var datasetstr = '';
    //console.assert(this.state.qsParams.datasets.length <= 1);
    for (var item in this.state.qsParams.datasets) {
      datasetstr = this.state.qsParams.datasets[item];
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
          value={{ value: this.state.qsParams.datasets, label: this.state.qsParams.datasets }}
          onChange={this.handleChange}
          options={dataSetOptions}
        />

        <Divider className={classes.divider} />

        <QueryForm
          queryType={querytype}
          datasetstr={datasetstr}
          dataSet={datasetstr}
        />
      </div>
    );
  }
}

Query.propTypes = {
  pluginList: PropTypes.array.isRequired,
  reconIndex: PropTypes.number.isRequired,
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  setURLQs: PropTypes.func.isRequired,
  urlQueryString: PropTypes.string.isRequired,
  availableDatasets: PropTypes.array.isRequired
};

var QueryState = function(state) {
  return {
    pluginList: state.app.get('pluginList'),
    reconIndex: state.app.get('reconIndex'),
    availableDatasets: state.neo4jsettings.availableDatasets,
    urlQueryString: state.app.get('urlQueryString')
  };
};

var QueryDispatch = function(dispatch) {
  return {
    setURLQs: function(querystring) {
      dispatch(setUrlQS(querystring));
    }
  };
};

export default withStyles(styles, { withTheme: true })(
  connect(
    QueryState,
    QueryDispatch
  )(Query)
);
