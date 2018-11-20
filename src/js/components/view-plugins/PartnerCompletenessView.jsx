import React from 'react';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import SimpleTable from './SimpleTable';
import Select from 'react-select';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';

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
    let inputTable = {
      result: {
        columns: ['id', 'name', '#connections', 'status', '#pre', '#post'],
        data: []
      }
    };
    let outputTable = {
      result: {
        columns: ['id', 'name', '#connections', 'status', '#pre', '#post'],
        data: []
      }
    };

    let allStatus = new Set();
    let highlightIndexInput = {};
    let highlightIndexOutput = {};

    let bodyStats = {
      bodyId: props.query.result.bodyId,
      name: '',
      pre: 0,
      post: 0,
      status: ''
    };

    for (let i = 0; i < props.query.result.data.length; i++) {
      let arr = [];
      let status = props.query.result.data[i][4];
      let highlight = false;
      if (status !== null && status !== '') {
        highlight = true;
        allStatus.add(status);
      }

      if (i === 0) {
        bodyStats.name = props.query.result.data[i][7];
        bodyStats.pre = props.query.result.data[i][8];
        bodyStats.post = props.query.result.data[i][9];
        bodyStats.status = props.query.result.data[i][10];
      }

      for (let j = 0; j < 7; j++) {
        if (j === 2) {
          continue;
        }
        arr.push(props.query.result.data[i][j]);
      }
      // check if isinput
      if (props.query.result.data[i][2]) {
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

    outputTable.result['disableSort'] = new Set([0, 1, 2, 3, 4, 5]);
    inputTable.result['disableSort'] = new Set([0, 1, 2, 3, 4, 5]);
    inputTable.result['highlightIndex'] = highlightIndexInput;
    outputTable.result['highlightIndex'] = highlightIndexOutput;

    let inputStats = this.highlightStats(inputTable.result.data, highlightIndexInput, 0);
    let outputStats = this.highlightStats(outputTable.result.data, highlightIndexOutput, 0);

    this.state = {
      inputTable: inputTable,
      outputTable: outputTable,
      allStatus: [...allStatus],
      selectedStatus: [...allStatus],
      bodyStats: bodyStats,
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
    for (let i = 0; i < table.length; i++) {
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
    let inputTable = this.state.inputTable;
    let outputTable = this.state.outputTable;
    let currSelected = selected.map(item => item.value);
    let currSelectedSet = new Set(currSelected);

    if (filter === '') {
      filter = 0;
    }

    let inputHighlight = {};
    let outputHighlight = {};
    for (let i = 0; i < inputTable.result.data.length; i++) {
      if (inputTable.result.data[i][2] <= filter) {
        inputHighlight[i] = 'pink';
      } else if (currSelectedSet.has(inputTable.result.data[i][3])) {
        inputHighlight[i] = 'lightblue';
      }
    }

    for (let i = 0; i < outputTable.result.data.length; i++) {
      if (outputTable.result.data[i][2] <= filter) {
        outputHighlight[i] = 'pink';
      } else if (currSelectedSet.has(outputTable.result.data[i][3])) {
        outputHighlight[i] = 'lightblue';
      }
    }

    inputTable.result['highlightIndex'] = inputHighlight;
    outputTable.result['highlightIndex'] = outputHighlight;

    let inputStats = this.highlightStats(inputTable.result.data, inputHighlight, filter);
    let outputStats = this.highlightStats(outputTable.result.data, outputHighlight, filter);

    this.setState({
      inputTable: inputTable,
      outputTable: outputTable,
      selectedStatus: currSelected,
      inputStats,
      outputStats
    });
  };

  handleChange = event => {
    let val = parseInt(event.target.value);
    if (event.target.value === '' || event.target.value === null) {
      val = '';
    }
    if (!isNaN(val) || val === '') {
      this.setState({
        orphanFilter: val
      });

      const currSelected = this.state.selectedStatus.map(name => {
        return {
          label: name,
          value: name
        };
      });
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
      outputStats
    } = this.state;

    const options = allStatus.map(name => {
      return {
        label: name,
        value: name
      };
    });
    const currSelected = selectedStatus.map(name => {
      return {
        label: name,
        value: name
      };
    });

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
          onChange={this.highlightRows(this.state.orphanFilter)}
          options={options}
          closeMenuOnSelect={false}
        />
        <TextField
          id="orphanfilter"
          label="Filter (ignore #conn <=)"
          className={classes.textField}
          value={this.state.orphanFilter}
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

export default withStyles(styles)(PartnerCompletenessView);
