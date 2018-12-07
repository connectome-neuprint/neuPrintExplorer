import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';

import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';

import SimpleTable from './SimpleTable';

const styles = theme => ({
  root: {},
  select: {
    fontFamily: theme.typography.fontFamily,
    margin: '0.5em 0 1em 0'
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200
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
    const filterLimit = (filter === '') ? 0 : filter;

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
      orphanFilter
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
        <InputLabel htmlFor="select-multiple-chip">Desired level of completeness</InputLabel>
        <Select
          className={classes.select}
          isMulti
          value={currSelected}
          onChange={this.highlightRows(orphanFilter)}
          options={options}
          closeMenuOnSelect={false}
        />
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
};

export default withStyles(styles)(PartnerCompletenessView);
