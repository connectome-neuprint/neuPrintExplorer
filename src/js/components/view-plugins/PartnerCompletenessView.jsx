import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { connect } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';

import SimpleTable from './SimpleTable';
import { metaInfoError } from '../../actions/app';

const styles = theme => ({
  root: {},
  select: {
    fontFamily: theme.typography.fontFamily
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200
  },
  tooltip: {
    color: 'red',
    verticalAlign: 'super',
    fontSize: '80%',
    marginLeft: theme.spacing.unit / 2
  }
});

class PartnerCompletenessView extends React.Component {
  constructor(props) {
    super(props);
    const inputTable = {
      result: {
        columns: ['id', 'name', '#connections', 'status', '#pre', '#post'],
        data: []
      }
    };
    const outputTable = {
      result: {
        columns: ['id', 'name', '#connections', 'status', '#pre', '#post'],
        data: []
      }
    };

    const { result } = props.query;

    const allStatus = new Set();
    const highlightIndexInput = {};
    const highlightIndexOutput = {};

    const bodyStats = {
      bodyId: result.bodyId,
      name: '',
      pre: 0,
      post: 0,
      status: ''
    };

    for (let i = 0; i < result.data.length; i += 1) {
      const arr = [];
      const status = result.data[i][4];
      let highlight = false;
      if (status !== null && status !== '') {
        highlight = true;
        allStatus.add(status);
      }

      /* eslint-disable prefer-destructuring */
      if (i === 0) {
        bodyStats.name = result.data[i][7];
        bodyStats.pre = result.data[i][8];
        bodyStats.post = result.data[i][9];
        bodyStats.status = result.data[i][10];
      }
      /* eslint-enable prefer-destructuring */

      for (let j = 0; j < 7; j += 1) {
        if (j !== 2) {
          arr.push(result.data[i][j]);
        }
      }
      // check if isinput
      if (result.data[i][2]) {
        if (highlight) {
          highlightIndexInput[inputTable.result.data.length] = 'lightblue';
        }
        inputTable.result.data.push(arr);
      } else {
        if (highlight) {
          highlightIndexOutput[outputTable.result.data.length] = 'lightblue';
        }
        outputTable.result.data.push(arr);
      }
    }

    outputTable.result.disableSort = new Set([0, 1, 2, 3, 4, 5]);
    inputTable.result.disableSort = new Set([0, 1, 2, 3, 4, 5]);
    inputTable.result.highlightIndex = highlightIndexInput;
    outputTable.result.highlightIndex = highlightIndexOutput;

    const inputStats = this.highlightStats(inputTable.result.data, highlightIndexInput, 0);
    const outputStats = this.highlightStats(outputTable.result.data, highlightIndexOutput, 0);

    this.queryStatusDefinitions(props.neoServer, props.query.dataSet);

    this.state = {
      inputTable,
      outputTable,
      allStatus: [...allStatus],
      selectedStatus: [...allStatus],
      bodyStats,
      inputStats,
      outputStats,
      orphanFilter: 0
    };
  }

  queryStatusDefinitions = (neoServer, dataset) => {
    const { actions } = this.props;
    if (neoServer === '') {
      return;
    }

    fetch('/api/custom/custom', {
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        dataset,
        cypher: `MATCH (n:Meta{dataset:"${dataset}"}) RETURN n.statusDefinitions`
      }),
      method: 'POST',
      credentials: 'include'
    })
      .then(result => {
        if (result.ok) {
          return result.json();
        }
        throw new Error(
          'Unable to fetch status definitions, try reloading the page. If this error persists, please contact support.'
        );
      })
      .then(resp => {
        let statusDefinitions = '';
        if (resp.data[0][0]) {
          const statusDefinitionsObject = JSON.parse(resp.data[0][0].replace(/'/g, '"'));
          Object.keys(statusDefinitionsObject).forEach((status, index) => {
            statusDefinitions += `${status}: ${statusDefinitionsObject[status]}`;
            if (index < Object.keys(statusDefinitionsObject).length - 1) {
              statusDefinitions += ', ';
            }
          });
        }
        this.setState({ statusDefinitions });
      })
      .catch(error => {
        actions.metaInfoError(error);
      });
  };

  highlightStats = (table, selected, filter) => {
    let totalconn = 0;
    let highconn = 0;
    let numbodies = 0;
    let numhigh = 0;
    for (let i = 0; i < table.length; i += 1) {
      if (table[i][2] <= filter) {
        break;
      }

      totalconn += table[i][2];
      numbodies += 1;
      if (i.toString() in selected) {
        highconn += table[i][2];
        numhigh += 1;
      }
    }

    return {
      totalconn,
      highconn,
      numbodies,
      numhigh
    };
  };

  highlightRows = filter => selected => {
    const { inputTable, outputTable } = this.state;
    const currSelected = selected.map(item => item.value);
    const currSelectedSet = new Set(currSelected);
    const filterLimit = filter === '' ? 0 : filter;

    const inputHighlight = {};
    const outputHighlight = {};
    for (let i = 0; i < inputTable.result.data.length; i += 1) {
      if (inputTable.result.data[i][2] <= filterLimit) {
        inputHighlight[i] = 'pink';
      } else if (currSelectedSet.has(inputTable.result.data[i][3])) {
        inputHighlight[i] = 'lightblue';
      }
    }

    for (let i = 0; i < outputTable.result.data.length; i += 1) {
      if (outputTable.result.data[i][2] <= filterLimit) {
        outputHighlight[i] = 'pink';
      } else if (currSelectedSet.has(outputTable.result.data[i][3])) {
        outputHighlight[i] = 'lightblue';
      }
    }

    inputTable.result.highlightIndex = inputHighlight;
    outputTable.result.highlightIndex = outputHighlight;

    const inputStats = this.highlightStats(inputTable.result.data, inputHighlight, filterLimit);
    const outputStats = this.highlightStats(outputTable.result.data, outputHighlight, filterLimit);

    this.setState({
      inputTable,
      outputTable,
      selectedStatus: currSelected,
      inputStats,
      outputStats
    });
  };

  handleChange = event => {
    const { selectedStatus } = this.state;
    let val = parseInt(event.target.value, 10);
    if (event.target.value === '' || event.target.value === null) {
      val = '';
    }
    if (/^\d+$/.test(val) || val === '') {
      this.setState({
        orphanFilter: val
      });

      const currSelected = selectedStatus.map(name => ({
        label: name,
        value: name
      }));
      this.highlightRows(val)(currSelected);
    }
  };

  render() {
    const { classes } = this.props;
    const {
      selectedStatus,
      allStatus,
      inputTable,
      outputTable,
      bodyStats,
      inputStats,
      outputStats,
      orphanFilter,
      statusDefinitions
    } = this.state;

    const options = allStatus.map(name => ({
      label: name,
      value: name
    }));
    const currSelected = selectedStatus.map(name => ({
      label: name,
      value: name
    }));

    const visProperties = { rowsPerPage: 10 };

    return (
      <div className={classes.root}>
        <Typography variant="h6">Neuron information</Typography>
        <Typography>Name: {bodyStats.name}</Typography>
        <Typography>Status: {bodyStats.status}</Typography>
        <Typography>
          #pre: {bodyStats.pre}, #post: {bodyStats.post}
        </Typography>
        <div style={{ marginTop: '8px', marginBottom: '8px' }}>
          <Typography variant="subtitle1" style={{ display: 'inline-flex' }}>
            Desired level of completeness
            <Tooltip id="tooltip-icon" title={statusDefinitions || ''} placement="right">
              <div className={classes.tooltip}>?</div>
            </Tooltip>
          </Typography>
          <Select
            className={classes.select}
            isMulti
            value={currSelected}
            onChange={this.highlightRows(orphanFilter)}
            options={options}
            closeMenuOnSelect={false}
          />
        </div>
        <TextField
          id="orphanfilter"
          label="Filter (ignore #conn <=)"
          className={classes.textField}
          value={orphanFilter}
          onChange={this.handleChange}
          margin="normal"
        />
        <Typography variant="h6">Inputs</Typography>
        <Typography>
          {((inputStats.highconn / inputStats.totalconn) * 100).toFixed(2)} percent connections,{' '}
          {inputStats.numhigh} bodies highlighted out of {inputStats.numbodies}
        </Typography>
        <SimpleTable query={inputTable} properties={visProperties} />
        <Typography variant="h6">Outputs</Typography>
        <Typography>
          {((outputStats.highconn / outputStats.totalconn) * 100).toFixed(2)} percent connections,{' '}
          {outputStats.numhigh} bodies highlighted out of {outputStats.numbodies}
        </Typography>
        <SimpleTable query={outputTable} properties={visProperties} />
      </div>
    );
  }
}

PartnerCompletenessView.propTypes = {
  query: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  neoServer: PropTypes.string.isRequired
};

const PartnerCompletenessViewState = state => ({
  neoServer: state.neo4jsettings.get('neoServer')
});

const PartnerCompletenessViewDispatch = dispatch => ({
  actions: {
    metaInfoError(error) {
      dispatch(metaInfoError(error));
    }
  }
});

export default withStyles(styles)(
  connect(
    PartnerCompletenessViewState,
    PartnerCompletenessViewDispatch
  )(PartnerCompletenessView)
);
